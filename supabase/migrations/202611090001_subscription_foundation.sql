create extension if not exists pgcrypto;
create type public.user_role as enum ('user','admin');
create type public.subscription_plan as enum ('market','full');
create type public.subscription_status as enum ('active','paused','revoked','expired');
create type public.subscription_source as enum ('manual','complimentary','payment','promotion');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null, display_name text, role public.user_role not null default 'user',
  created_at timestamptz not null default now(), last_seen_at timestamptz
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  plan public.subscription_plan not null, status public.subscription_status not null,
  starts_at timestamptz not null, expires_at timestamptz not null,
  source public.subscription_source not null, note text, created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint subscription_positive_duration check (expires_at > starts_at)
);
create unique index one_current_subscription_per_user on public.subscriptions(user_id) where status <> 'revoked';
create table public.devices (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  device_id_hash text not null, platform text not null check(platform in ('windows','macos')),
  app_version text not null, first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), revoked_at timestamptz,
  unique(user_id,device_id_hash)
);
create table public.subscription_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id), action text not null,
  previous_value jsonb, new_value jsonb, performed_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.market_snapshots (
  id bigint generated always as identity primary key, published_at timestamptz not null,
  payload jsonb not null, created_at timestamptz not null default now()
);
create table public.desktop_auth_codes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  code_hash text not null unique, pkce_challenge text not null, callback_url text not null,
  expires_at timestamptz not null, consumed_at timestamptz, created_at timestamptz not null default now()
);
create table public.desktop_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique, device_id_hash text, expires_at timestamptz not null,
  revoked_at timestamptz, created_at timestamptz not null default now(), last_seen_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,email) values(new.id,coalesce(new.email,'')) on conflict(id) do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;

create or replace function public.update_user_subscription(p_user_id uuid,p_plan public.subscription_plan,p_status public.subscription_status,p_starts_at timestamptz,p_expires_at timestamptz,p_source public.subscription_source,p_note text default null)
returns public.subscriptions language plpgsql security definer set search_path=public as $$
declare old_row public.subscriptions; new_row public.subscriptions; action_name text;
begin
  if not public.is_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if p_expires_at <= p_starts_at then raise exception 'invalid_subscription_duration'; end if;
  select * into old_row from public.subscriptions where user_id=p_user_id and status<>'revoked' for update;
  action_name := case when old_row.id is null then 'grant' when p_status='revoked' then 'revoke' when p_status='paused' then 'pause' when old_row.plan<>p_plan then 'change_plan' when p_expires_at>old_row.expires_at then 'extend' else 'update' end;
  if old_row.id is null then insert into public.subscriptions(user_id,plan,status,starts_at,expires_at,source,note,created_by) values(p_user_id,p_plan,p_status,p_starts_at,p_expires_at,p_source,p_note,auth.uid()) returning * into new_row;
  else update public.subscriptions set plan=p_plan,status=p_status,starts_at=p_starts_at,expires_at=p_expires_at,source=p_source,note=p_note,updated_at=now() where id=old_row.id returning * into new_row; end if;
  insert into public.subscription_events(user_id,subscription_id,action,previous_value,new_value,performed_by) values(p_user_id,new_row.id,action_name,to_jsonb(old_row),to_jsonb(new_row),auth.uid());
  return new_row;
end $$;

alter table public.profiles enable row level security; alter table public.subscriptions enable row level security; alter table public.devices enable row level security; alter table public.subscription_events enable row level security;
alter table public.market_snapshots enable row level security;
alter table public.desktop_auth_codes enable row level security;
alter table public.desktop_sessions enable row level security;
create policy profile_self_read on public.profiles for select using(id=auth.uid() or public.is_admin());
create policy subscription_self_read on public.subscriptions for select using(user_id=auth.uid() or public.is_admin());
create policy device_self_read on public.devices for select using(user_id=auth.uid() or public.is_admin());
create policy event_self_read on public.subscription_events for select using(user_id=auth.uid() or public.is_admin());
revoke all on function public.update_user_subscription from public, anon, authenticated;
grant execute on function public.update_user_subscription to authenticated;

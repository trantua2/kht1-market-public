alter table public.payment_orders
  add column if not exists target_plan public.subscription_plan not null default 'market';

create table if not exists public.internal_migrations (
  key text primary key,
  applied_at timestamptz not null default now()
);
alter table public.internal_migrations enable row level security;

do $$
begin
  if not exists(select 1 from public.internal_migrations where key='plus_tier_initial_downgrade') then
    update public.subscriptions set plan='market',updated_at=now() where plan='full' and status<>'revoked';
    insert into public.internal_migrations(key) values('plus_tier_initial_downgrade');
  end if;
end $$;

create table if not exists public.market_rate_limits (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 0 check(request_count>=0),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_access_audit (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  ip_hash text not null,
  user_agent text,
  reason text not null,
  request_count integer,
  created_at timestamptz not null default now()
);

alter table public.market_rate_limits enable row level security;
alter table public.market_access_audit enable row level security;

create or replace function public.consume_market_rate_limit(p_user_id uuid,p_limit integer default 30)
returns table(allowed boolean,remaining integer,retry_after integer,request_count integer)
language plpgsql security definer set search_path=public as $$
declare current_window timestamptz:=date_trunc('minute',clock_timestamp()); current_count integer;
begin
  if p_limit<1 or p_limit>300 then raise exception 'invalid_rate_limit'; end if;
  insert into public.market_rate_limits(user_id,window_start,request_count)
  values(p_user_id,current_window,1)
  on conflict(user_id) do update set
    window_start=case when market_rate_limits.window_start=current_window then market_rate_limits.window_start else current_window end,
    request_count=case when market_rate_limits.window_start=current_window then market_rate_limits.request_count+1 else 1 end,
    updated_at=now()
  returning market_rate_limits.request_count into current_count;
  return query select current_count<=p_limit,greatest(p_limit-current_count,0),
    greatest(1,60-extract(second from clock_timestamp())::integer),current_count;
end $$;

revoke all on function public.consume_market_rate_limit(uuid,integer) from public,anon,authenticated;
grant execute on function public.consume_market_rate_limit(uuid,integer) to service_role;

create or replace function public.complete_payment_order(
  p_order_code bigint,p_amount integer,p_payment_link_id text,p_reference text
) returns public.subscriptions
language plpgsql security definer set search_path=public as $$
declare payment_row public.payment_orders; old_row public.subscriptions; new_row public.subscriptions; start_time timestamptz; expiry_base timestamptz;
begin
  select * into payment_row from public.payment_orders where order_code=p_order_code for update;
  if payment_row.id is null then raise exception 'payment_order_not_found'; end if;
  if payment_row.amount<>p_amount or payment_row.currency<>'VND' then raise exception 'payment_amount_mismatch'; end if;
  if payment_row.provider_payment_id is not null and payment_row.provider_payment_id<>p_payment_link_id then raise exception 'payment_link_mismatch'; end if;
  select * into old_row from public.subscriptions where user_id=payment_row.user_id and status<>'revoked' for update;
  if payment_row.status='paid' then return old_row; end if;
  if payment_row.status<>'pending' then raise exception 'payment_order_not_pending'; end if;
  start_time:=case when old_row.id is not null and old_row.expires_at>now() then old_row.starts_at else now() end;
  expiry_base:=case when old_row.id is not null and old_row.expires_at>now() then old_row.expires_at else now() end;
  if old_row.id is null then
    insert into public.subscriptions(user_id,plan,status,starts_at,expires_at,source,note)
    values(payment_row.user_id,payment_row.target_plan,'active',start_time,expiry_base+make_interval(days=>payment_row.duration_days),'payment','SePay '||p_order_code)
    returning * into new_row;
  else
    update public.subscriptions set plan=payment_row.target_plan,status='active',starts_at=start_time,
      expires_at=expiry_base+make_interval(days=>payment_row.duration_days),source='payment',note='SePay '||p_order_code,updated_at=now()
    where id=old_row.id returning * into new_row;
  end if;
  update public.payment_orders set status='paid',provider_payment_id=p_payment_link_id,provider_reference=p_reference,paid_at=now(),updated_at=now() where id=payment_row.id;
  insert into public.subscription_events(user_id,subscription_id,action,previous_value,new_value)
    values(payment_row.user_id,new_row.id,case when old_row.id is null then 'payment_grant' else 'payment_extend' end,to_jsonb(old_row),to_jsonb(new_row));
  return new_row;
end $$;

revoke all on function public.complete_payment_order(bigint,integer,text,text) from public,anon,authenticated;
grant execute on function public.complete_payment_order(bigint,integer,text,text) to service_role;

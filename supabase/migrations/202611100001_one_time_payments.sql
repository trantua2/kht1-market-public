create table public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_code text not null,
  duration_days integer not null check(duration_days > 0),
  amount integer not null check(amount > 0),
  currency text not null default 'VND' check(currency = 'VND'),
  order_code bigint not null unique,
  provider text not null default 'payos' check(provider = 'payos'),
  provider_payment_id text unique,
  checkout_url text,
  status text not null default 'pending' check(status in ('pending','paid','cancelled','expired','failed')),
  provider_reference text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_orders enable row level security;
create policy payment_order_self_read on public.payment_orders for select using(user_id=auth.uid() or public.is_admin());

create or replace function public.complete_payment_order(
  p_order_code bigint,
  p_amount integer,
  p_payment_link_id text,
  p_reference text
) returns public.subscriptions
language plpgsql security definer set search_path=public as $$
declare
  payment_row public.payment_orders;
  old_row public.subscriptions;
  new_row public.subscriptions;
  start_time timestamptz;
  expiry_base timestamptz;
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
    values(payment_row.user_id,'full','active',start_time,expiry_base+make_interval(days=>payment_row.duration_days),'payment','payOS '||p_order_code)
    returning * into new_row;
  else
    update public.subscriptions set plan='full',status='active',starts_at=start_time,
      expires_at=expiry_base+make_interval(days=>payment_row.duration_days),source='payment',note='payOS '||p_order_code,updated_at=now()
    where id=old_row.id returning * into new_row;
  end if;

  update public.payment_orders set status='paid',provider_payment_id=p_payment_link_id,
    provider_reference=p_reference,paid_at=now(),updated_at=now() where id=payment_row.id;
  insert into public.subscription_events(user_id,subscription_id,action,previous_value,new_value)
    values(payment_row.user_id,new_row.id,case when old_row.id is null then 'payment_grant' else 'payment_extend' end,to_jsonb(old_row),to_jsonb(new_row));
  return new_row;
end $$;

revoke all on function public.complete_payment_order(bigint,integer,text,text) from public,anon,authenticated;
grant execute on function public.complete_payment_order(bigint,integer,text,text) to service_role;

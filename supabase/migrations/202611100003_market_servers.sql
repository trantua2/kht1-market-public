create table public.market_servers (
  slug text primary key,
  code text not null,
  name text not null,
  is_active boolean not null default true,
  is_default boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint market_server_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index one_default_market_server
  on public.market_servers (is_default)
  where is_default;

insert into public.market_servers(slug,code,name,is_active,is_default,display_order)
values ('s7-cuu-long','S7','Cửu Long',true,true,10)
on conflict (slug) do update set
  code=excluded.code,
  name=excluded.name,
  is_active=excluded.is_active,
  is_default=excluded.is_default,
  display_order=excluded.display_order,
  updated_at=now();

alter table public.market_snapshots add column server_slug text;

update public.market_snapshots
set server_slug = 's7-cuu-long'
where server_slug is null;

alter table public.market_snapshots
  alter column server_slug set not null,
  add constraint market_snapshots_server_slug_fkey
    foreign key (server_slug) references public.market_servers(slug);

create index market_snapshots_server_published_idx
  on public.market_snapshots (server_slug, published_at desc);

alter table public.market_servers enable row level security;
create policy market_servers_public_read on public.market_servers
  for select using (is_active);
grant select on public.market_servers to anon, authenticated;

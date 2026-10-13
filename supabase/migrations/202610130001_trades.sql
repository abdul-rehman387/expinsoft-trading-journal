create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  source text not null default 'Manual',
  date text not null,
  "exitDate" text not null,
  asset text not null,
  market text not null check (market in ('Spot', 'Perpetual')),
  direction text not null check (direction in ('Long', 'Short')),
  entry double precision not null check (entry > 0),
  exit double precision not null check (exit > 0),
  size double precision not null check (size > 0),
  fees double precision not null default 0,
  funding double precision not null default 0,
  gas double precision not null default 0,
  leverage double precision not null default 1 check (leverage >= 1),
  strategy text not null default '',
  pnl double precision not null default 0,
  notes text not null default '',
  exchange text not null default ''
);
create index trades_user_created_idx on public.trades(user_id, created_at desc);
alter table public.trades enable row level security;
revoke all on public.trades from anon;
grant select, insert, update, delete on public.trades to authenticated;
create policy "Read own trades" on public.trades for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own trades" on public.trades for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own trades" on public.trades for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own trades" on public.trades for delete to authenticated using ((select auth.uid()) = user_id);

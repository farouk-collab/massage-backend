create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  plan_type text not null default 'pack_5',
  total_sessions integer not null default 5 check (total_sessions >= 0),
  remaining_sessions integer not null default 5 check (remaining_sessions >= 0),
  price_cents integer not null default 22500 check (price_cents >= 0),
  currency text not null default 'EUR',
  status text not null default 'active' check (status in ('pending', 'active', 'completed', 'cancelled')),
  limited_offer boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_client_id_idx
on public.subscriptions(client_id);

create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists slots_starts_at_idx
on public.slots(starts_at);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  slot_id uuid not null references public.slots(id) on delete restrict,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  massage_type text not null default 'massage',
  payment_type text not null default 'single' check (payment_type in ('single', 'subscription')),
  amount_cents integer not null default 8000 check (amount_cents >= 0),
  currency text not null default 'EUR',
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'validated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists bookings_active_slot_unique_idx
on public.bookings(slot_id)
where status in ('pending', 'confirmed', 'validated');

create index if not exists bookings_client_id_idx
on public.bookings(client_id);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.handle_updated_at();

drop trigger if exists slots_set_updated_at on public.slots;
create trigger slots_set_updated_at
before update on public.slots
for each row
execute function public.handle_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.handle_updated_at();

alter table public.subscriptions enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (auth.uid() = client_id);

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own"
on public.subscriptions
for insert
to authenticated
with check (auth.uid() = client_id);

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
on public.subscriptions
for update
to authenticated
using (auth.uid() = client_id)
with check (auth.uid() = client_id);

drop policy if exists "slots_public_select" on public.slots;
create policy "slots_public_select"
on public.slots
for select
to anon, authenticated
using (true);

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
on public.bookings
for select
to authenticated
using (auth.uid() = client_id);

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
on public.bookings
for insert
to authenticated
with check (auth.uid() = client_id);

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own"
on public.bookings
for update
to authenticated
using (auth.uid() = client_id)
with check (auth.uid() = client_id);

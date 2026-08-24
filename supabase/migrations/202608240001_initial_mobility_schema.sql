create extension if not exists pgcrypto;
create extension if not exists postgis;

create type public.app_role as enum ('PASSENGER', 'DRIVER', 'ADMIN', 'SUPPORT', 'SUPER_ADMIN');
create type public.driver_status as enum ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
create type public.ride_status as enum ('REQUESTING', 'SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'TRIP_STARTED', 'TRIP_COMPLETED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED');
create type public.payment_status as enum ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED');
create type public.service_type as enum ('BEARGO', 'BEARGO_PLUS', 'BEARGO_GREEN');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text,
  role public.app_role not null default 'PASSENGER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.drivers (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  status public.driver_status not null default 'PENDING',
  rating numeric(3,2) not null default 5 check (rating between 1 and 5),
  completed_rides integer not null default 0 check (completed_rides >= 0),
  last_location geography(point, 4326),
  is_online boolean not null default false,
  updated_at timestamptz not null default now()
);
create table public.vehicles (
  id uuid primary key default gen_random_uuid(), driver_id uuid not null references public.drivers(profile_id) on delete cascade,
  make text not null, model text not null, year smallint not null check (year between 1990 and 2100), plate text not null unique, service_type public.service_type not null default 'BEARGO', active boolean not null default true, created_at timestamptz not null default now()
);
create table public.service_zones (
  id uuid primary key default gen_random_uuid(), name text not null unique, city text not null, province text not null, country_code char(2) not null default 'AR', boundary geography(multipolygon, 4326), active boolean not null default true, created_at timestamptz not null default now()
);
create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(), zone_id uuid not null references public.service_zones(id), service_type public.service_type not null,
  base_fare_cents integer not null check (base_fare_cents >= 0), price_per_km_cents integer not null check (price_per_km_cents >= 0), price_per_minute_cents integer not null check (price_per_minute_cents >= 0), minimum_fare_cents integer not null check (minimum_fare_cents >= 0), booking_fee_cents integer not null default 0 check (booking_fee_cents >= 0), peak_multiplier numeric(5,2) not null default 1 check (peak_multiplier >= 1), night_multiplier numeric(5,2) not null default 1 check (night_multiplier >= 1), active boolean not null default true, created_at timestamptz not null default now(), unique(zone_id, service_type)
);
create table public.ride_requests (
  id uuid primary key default gen_random_uuid(), passenger_id uuid not null references public.profiles(id), zone_id uuid references public.service_zones(id), service_type public.service_type not null,
  pickup geography(point, 4326) not null, pickup_address text not null, destination geography(point, 4326) not null, destination_address text not null,
  estimated_distance_meters integer not null check (estimated_distance_meters > 0), estimated_duration_seconds integer not null check (estimated_duration_seconds > 0), quoted_fare_cents integer not null check (quoted_fare_cents >= 0), status public.ride_status not null default 'REQUESTING', created_at timestamptz not null default now()
);
create table public.rides (
  id uuid primary key default gen_random_uuid(), request_id uuid not null unique references public.ride_requests(id), passenger_id uuid not null references public.profiles(id), driver_id uuid references public.drivers(profile_id), vehicle_id uuid references public.vehicles(id), status public.ride_status not null default 'REQUESTING', fare_cents integer not null check (fare_cents >= 0), status_version integer not null default 0, started_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ride_locations (
  id bigint generated always as identity primary key, ride_id uuid not null references public.rides(id) on delete cascade, recorded_at timestamptz not null default now(), location geography(point, 4326) not null, source text not null check (source in ('PASSENGER', 'DRIVER', 'SYSTEM'))
);
create table public.ratings (id uuid primary key default gen_random_uuid(), ride_id uuid not null references public.rides(id) on delete cascade, author_id uuid not null references public.profiles(id), recipient_id uuid not null references public.profiles(id), rating smallint not null check (rating between 1 and 5), comment text check (char_length(comment) <= 1000), tags text[] not null default '{}', created_at timestamptz not null default now(), unique(ride_id, author_id));
create table public.favorites (id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, label text not null, address text not null, location geography(point, 4326) not null, created_at timestamptz not null default now(), unique(profile_id, label));
create table public.notifications (id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, event_type text not null, payload jsonb not null default '{}', read_at timestamptz, created_at timestamptz not null default now());
create table public.payments (id uuid primary key default gen_random_uuid(), ride_id uuid not null unique references public.rides(id), provider text not null, provider_reference text unique, status public.payment_status not null default 'PENDING', amount_cents integer not null check (amount_cents >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.support_tickets (id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id), ride_id uuid references public.rides(id), subject text not null, body text not null, status text not null default 'OPEN', created_at timestamptz not null default now());

create index drivers_available_location_idx on public.drivers using gist(last_location) where is_online and status = 'APPROVED';
create index rides_passenger_created_idx on public.rides(passenger_id, created_at desc);
create index rides_driver_created_idx on public.rides(driver_id, created_at desc);
create index rides_status_created_idx on public.rides(status, created_at desc);
create index ride_locations_ride_recorded_idx on public.ride_locations(ride_id, recorded_at desc);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', 'Usuario BearRide')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create function public.current_role() returns public.app_role language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid() $$;
create function public.is_staff() returns boolean language sql stable security definer set search_path = public as $$ select public.current_role() in ('ADMIN', 'SUPPORT', 'SUPER_ADMIN') $$;

alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.service_zones enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.ride_requests enable row level security;
alter table public.rides enable row level security;
alter table public.ride_locations enable row level security;
alter table public.ratings enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;
alter table public.support_tickets enable row level security;

create policy "profiles read own or staff" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "profiles update own safe fields" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = public.current_role());
create policy "drivers own or staff" on public.drivers for select using (profile_id = auth.uid() or public.is_staff());
create policy "vehicles own or staff" on public.vehicles for select using (driver_id = auth.uid() or public.is_staff());
create policy "zones read active" on public.service_zones for select using (active or public.is_staff());
create policy "pricing read active" on public.pricing_rules for select using (active or public.is_staff());
create policy "requests own or staff" on public.ride_requests for select using (passenger_id = auth.uid() or public.is_staff());
create policy "rides participant or staff" on public.rides for select using (passenger_id = auth.uid() or driver_id = auth.uid() or public.is_staff());
create policy "ride locations participant or staff" on public.ride_locations for select using (exists (select 1 from public.rides r where r.id = ride_id and (r.passenger_id = auth.uid() or r.driver_id = auth.uid() or public.is_staff())));
create policy "ratings participant read" on public.ratings for select using (author_id = auth.uid() or recipient_id = auth.uid() or public.is_staff());
create policy "favorites own" on public.favorites for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "notifications own" on public.notifications for select using (profile_id = auth.uid());
create policy "tickets own or staff" on public.support_tickets for select using (profile_id = auth.uid() or public.is_staff());

revoke all on all tables in schema public from anon;
grant select on public.service_zones, public.pricing_rules to authenticated;

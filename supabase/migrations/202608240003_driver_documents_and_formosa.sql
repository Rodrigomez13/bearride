create table public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(profile_id) on delete cascade,
  document_type text not null check (document_type in ('IDENTITY', 'LICENSE', 'VEHICLE_REGISTRATION', 'INSURANCE', 'BACKGROUND_CHECK', 'PROFILE_PHOTO')),
  storage_path text not null unique,
  expires_at date,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(driver_id, document_type)
);
alter table public.driver_documents enable row level security;
create policy "driver documents own or staff" on public.driver_documents for select using (driver_id = auth.uid() or public.is_staff());

insert into public.service_zones(name, city, province, country_code, boundary)
values (
  'Formosa inicial', 'Formosa', 'Formosa', 'AR',
  st_geogfromtext('MULTIPOLYGON(((-58.245 -26.235, -58.105 -26.235, -58.105 -26.105, -58.245 -26.105, -58.245 -26.235)))')
) on conflict (name) do nothing;

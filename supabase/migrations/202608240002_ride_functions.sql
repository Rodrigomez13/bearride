create function public.quote_ride(
  p_pickup_lat double precision, p_pickup_lng double precision,
  p_service_type public.service_type, p_distance_meters integer, p_duration_seconds integer
) returns table(zone_id uuid, fare_cents integer)
language plpgsql stable security definer set search_path = public as $$
declare v_zone public.service_zones; v_rule public.pricing_rules; v_fare numeric;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_pickup_lat not between -90 and 90 or p_pickup_lng not between -180 and 180 or p_distance_meters <= 0 or p_duration_seconds <= 0 then raise exception 'invalid ride quote input'; end if;
  select * into v_zone from public.service_zones z where z.active and z.boundary is not null and st_covers(z.boundary, st_setsrid(st_makepoint(p_pickup_lng, p_pickup_lat), 4326)::geography) limit 1;
  if v_zone.id is null then raise exception 'pickup outside active service zone'; end if;
  select * into v_rule from public.pricing_rules r where r.zone_id = v_zone.id and r.service_type = p_service_type and r.active;
  if v_rule.id is null then raise exception 'pricing unavailable'; end if;
  v_fare := greatest(v_rule.minimum_fare_cents, (v_rule.base_fare_cents + p_distance_meters::numeric / 1000 * v_rule.price_per_km_cents + p_duration_seconds::numeric / 60 * v_rule.price_per_minute_cents) * greatest(v_rule.peak_multiplier, v_rule.night_multiplier)) + v_rule.booking_fee_cents;
  return query select v_zone.id, round(v_fare)::integer;
end; $$;

create function public.create_ride_request(
  p_pickup_lat double precision, p_pickup_lng double precision, p_pickup_address text,
  p_destination_lat double precision, p_destination_lng double precision, p_destination_address text,
  p_service_type public.service_type, p_distance_meters integer, p_duration_seconds integer
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_quote record; v_request_id uuid; v_ride_id uuid;
begin
  if auth.uid() is null or public.current_role() <> 'PASSENGER' then raise exception 'only passengers can request rides'; end if;
  if length(trim(p_pickup_address)) < 3 or length(trim(p_destination_address)) < 3 then raise exception 'invalid address'; end if;
  select * into v_quote from public.quote_ride(p_pickup_lat, p_pickup_lng, p_service_type, p_distance_meters, p_duration_seconds);
  insert into public.ride_requests(passenger_id, zone_id, service_type, pickup, pickup_address, destination, destination_address, estimated_distance_meters, estimated_duration_seconds, quoted_fare_cents, status)
  values (auth.uid(), v_quote.zone_id, p_service_type, st_setsrid(st_makepoint(p_pickup_lng, p_pickup_lat),4326)::geography, trim(p_pickup_address), st_setsrid(st_makepoint(p_destination_lng,p_destination_lat),4326)::geography, trim(p_destination_address), p_distance_meters, p_duration_seconds, v_quote.fare_cents, 'SEARCHING_DRIVER') returning id into v_request_id;
  insert into public.rides(request_id, passenger_id, status, fare_cents) values(v_request_id, auth.uid(), 'SEARCHING_DRIVER', v_quote.fare_cents) returning id into v_ride_id;
  return v_ride_id;
end; $$;

create function public.transition_ride(p_ride_id uuid, p_next_status public.ride_status)
returns void language plpgsql security definer set search_path = public as $$
declare v_ride public.rides; v_role public.app_role; v_allowed boolean := false;
begin
  select * into v_ride from public.rides where id = p_ride_id for update;
  if v_ride.id is null then raise exception 'ride not found'; end if;
  v_role := public.current_role();
  v_allowed := (v_role = 'PASSENGER' and v_ride.passenger_id = auth.uid() and v_ride.status in ('REQUESTING','SEARCHING_DRIVER','DRIVER_ASSIGNED','DRIVER_ARRIVING','DRIVER_ARRIVED') and p_next_status = 'CANCELLED')
    or (v_role = 'DRIVER' and v_ride.driver_id = auth.uid() and ((v_ride.status = 'DRIVER_ASSIGNED' and p_next_status = 'DRIVER_ARRIVING') or (v_ride.status = 'DRIVER_ARRIVING' and p_next_status = 'DRIVER_ARRIVED') or (v_ride.status = 'DRIVER_ARRIVED' and p_next_status = 'TRIP_STARTED') or (v_ride.status = 'TRIP_STARTED' and p_next_status = 'TRIP_COMPLETED')))
    or (public.is_staff() and p_next_status = 'CANCELLED');
  if not v_allowed then raise exception 'invalid ride transition'; end if;
  update public.rides set status = p_next_status, status_version = status_version + 1, started_at = case when p_next_status = 'TRIP_STARTED' then now() else started_at end, completed_at = case when p_next_status = 'TRIP_COMPLETED' then now() else completed_at end, updated_at = now() where id = p_ride_id;
  update public.ride_requests set status = p_next_status where id = v_ride.request_id;
end; $$;

create function public.update_driver_availability(
  p_is_online boolean, p_latitude double precision default null, p_longitude double precision default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.current_role() <> 'DRIVER' then raise exception 'driver access required'; end if;
  if exists (select 1 from public.drivers where profile_id = auth.uid() and status <> 'APPROVED') then raise exception 'driver is not approved'; end if;
  if (p_latitude is null) <> (p_longitude is null) or p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then raise exception 'invalid location'; end if;
  update public.drivers set is_online = p_is_online, last_location = case when p_latitude is null then last_location else st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography end, updated_at = now() where profile_id = auth.uid();
end; $$;

revoke all on function public.quote_ride(double precision, double precision, public.service_type, integer, integer) from public;
revoke all on function public.create_ride_request(double precision, double precision, text, double precision, double precision, text, public.service_type, integer, integer) from public;
revoke all on function public.transition_ride(uuid, public.ride_status) from public;
revoke all on function public.update_driver_availability(boolean, double precision, double precision) from public;
grant execute on function public.quote_ride(double precision, double precision, public.service_type, integer, integer) to authenticated;
grant execute on function public.create_ride_request(double precision, double precision, text, double precision, double precision, text, public.service_type, integer, integer) to authenticated;
grant execute on function public.transition_ride(uuid, public.ride_status) to authenticated;
grant execute on function public.update_driver_availability(boolean, double precision, double precision) to authenticated;

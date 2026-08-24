'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, LocateFixed, Navigation, Search, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MapboxMap, type Coordinates } from '@/components/map/mapbox-map'

type Place = Coordinates & { id: string; label: string }
type Route = { distanceMeters: number; durationSeconds: number; geometry: { coordinates: [number, number][] } }
type ServiceType = 'BEARGO' | 'BEARGO_PLUS' | 'BEARGO_GREEN'

const fallback: Place = { id: 'formosa-center', label: 'Ubicación actual en Formosa', latitude: -26.1775, longitude: -58.1754 }
const services: Array<{ id: ServiceType; title: string; detail: string }> = [
  { id: 'BEARGO', title: 'BearRide', detail: 'La opción más rápida' },
  { id: 'BEARGO_PLUS', title: 'BearRide Plus', detail: 'Más espacio y confort' },
  { id: 'BEARGO_GREEN', title: 'BearRide Green', detail: 'Menor impacto ambiental' },
]

function formatMoney(cents: number) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cents / 100) }

export function RideRequest() {
  const [origin, setOrigin] = useState<Place>(fallback)
  const [destination, setDestination] = useState<Place | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(false)
  const [route, setRoute] = useState<Route | null>(null)
  const [serviceType, setServiceType] = useState<ServiceType>('BEARGO')
  const [fareCents, setFareCents] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'locating' | 'quoting' | 'requesting' | 'confirmed'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (query.trim().length < 3 || destination?.label === query) { setResults([]); return }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try { const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, { signal: controller.signal }); const data = await response.json(); setResults(data.results ?? []) } catch { setResults([]) } finally { setSearching(false) }
    }, 350)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [query, destination?.label])

  useEffect(() => {
    if (!destination) { setRoute(null); setFareCents(null); return }
    const controller = new AbortController()
    setStatus('quoting'); setError('')
    void (async () => {
      try {
        const params = new URLSearchParams({ pickupLng: String(origin.longitude), pickupLat: String(origin.latitude), destinationLng: String(destination.longitude), destinationLat: String(destination.latitude) })
        const routeResponse = await fetch(`/api/route?${params}`, { signal: controller.signal })
        const routeData = await routeResponse.json()
        if (!routeResponse.ok) throw new Error(routeData.error ?? 'No pudimos calcular la ruta.')
        const nextRoute = routeData as Route
        setRoute(nextRoute)
        const { data, error: quoteError } = await createClient().rpc('quote_ride', { p_pickup_lat: origin.latitude, p_pickup_lng: origin.longitude, p_service_type: serviceType, p_distance_meters: nextRoute.distanceMeters, p_duration_seconds: nextRoute.durationSeconds })
        if (quoteError) throw quoteError
        const quote = Array.isArray(data) ? data[0] : data
        if (!quote?.fare_cents) throw new Error('No hay una tarifa activa para este viaje.')
        setFareCents(quote.fare_cents)
      } catch (cause) { if (!controller.signal.aborted) { setRoute(null); setFareCents(null); setError(cause instanceof Error ? cause.message : 'No pudimos cotizar el viaje.') } } finally { if (!controller.signal.aborted) setStatus('idle') }
    })()
    return () => controller.abort()
  }, [destination, origin, serviceType])

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('Tu navegador no permite usar ubicación. Elegí un punto en el mapa.'); return }
    setStatus('locating'); setError('')
    navigator.geolocation.getCurrentPosition((position) => { setOrigin({ id: 'my-location', label: 'Tu ubicación actual', latitude: position.coords.latitude, longitude: position.coords.longitude }); setStatus('idle') }, () => { setError('No pudimos acceder a tu ubicación. Revisá los permisos o elegí un punto en el mapa.'); setStatus('idle') }, { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 })
  }
  const chooseDestination = (place: Place) => { setDestination(place); setQuery(place.label); setResults([]) }
  const chooseMapPoint = (point: Coordinates) => chooseDestination({ id: `map-${point.latitude}-${point.longitude}`, label: 'Punto elegido en el mapa', ...point })
  const requestRide = async () => {
    if (!destination || !route || fareCents === null) return
    setStatus('requesting'); setError('')
    const { error: requestError } = await createClient().rpc('create_ride_request', { p_pickup_lat: origin.latitude, p_pickup_lng: origin.longitude, p_pickup_address: origin.label, p_destination_lat: destination.latitude, p_destination_lng: destination.longitude, p_destination_address: destination.label, p_service_type: serviceType, p_distance_meters: route.distanceMeters, p_duration_seconds: route.durationSeconds })
    if (requestError) { setError(requestError.message); setStatus('idle'); return }
    setStatus('confirmed')
  }

  if (status === 'confirmed') return <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm"><div className="flex size-12 items-center justify-center rounded-2xl bg-primary/20 text-primary"><CheckCircle2 aria-hidden="true" /></div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Solicitud confirmada</p><h2 className="mt-2 font-serif text-3xl text-balance">Estamos buscando tu conductor</h2></div><p className="leading-relaxed text-muted-foreground">Te vamos a avisar cuando un conductor acepte el viaje. Podés seguir cada cambio desde tus viajes.</p><a className="min-h-12 rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-foreground" href="/passenger/history">Ver mis viajes</a></section>

  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,.85fr)]"><div className="order-1 min-h-[20rem] overflow-hidden rounded-3xl border border-border bg-secondary shadow-sm lg:order-2 lg:min-h-[38rem]"><MapboxMap origin={origin} destination={destination} route={route?.geometry} onLocation={chooseMapPoint} /></div><section className="order-2 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm lg:order-1 lg:p-6"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Nuevo viaje · Formosa</p><h2 className="mt-1 font-serif text-3xl text-balance">¿A dónde vamos?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Usá tu ubicación o elegí el punto de partida y destino con el mapa.</p></div><button type="button" className="flex min-h-16 items-center gap-3 rounded-2xl border border-border p-4 text-left transition hover:border-primary" onClick={useMyLocation} disabled={status === 'locating'}><LocateFixed className="text-primary" aria-hidden="true" /><span><small className="block text-muted-foreground">Partida</small><strong>{status === 'locating' ? 'Buscando tu ubicación…' : origin.label}</strong></span></button><div className="relative"><label htmlFor="destination" className="sr-only">Buscar destino</label><Search className="pointer-events-none absolute left-4 top-4 text-muted-foreground" aria-hidden="true" /><input id="destination" value={query} onChange={(event) => { setQuery(event.target.value); setDestination(null) }} placeholder="Buscá una dirección o lugar" autoComplete="off" className="min-h-14 w-full rounded-2xl border border-border bg-background py-4 pl-11 pr-4 outline-none focus:ring-2 focus:ring-ring" />{(searching || results.length > 0) && <div className="absolute inset-x-0 top-full z-10 mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-lg" role="listbox">{searching && <p className="p-3 text-sm text-muted-foreground">Buscando direcciones…</p>}{!searching && results.map((place) => <button type="button" key={place.id} className="rounded-xl p-3 text-left text-sm transition hover:bg-secondary" onClick={() => chooseDestination(place)}>{place.label}</button>)}</div>}</div>{destination && <><div className="grid gap-2 sm:grid-cols-3">{services.map((service) => <button key={service.id} type="button" onClick={() => setServiceType(service.id)} className={`rounded-xl border p-3 text-left text-sm transition ${service.id === serviceType ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border hover:border-primary'}`}><strong className="block">{service.title}</strong><span className="mt-1 block text-xs text-muted-foreground">{service.detail}</span></button>)}</div><div className="flex flex-col gap-3 rounded-2xl bg-secondary p-4"><div className="flex items-start gap-3"><Navigation className="mt-0.5 text-primary" aria-hidden="true" /><div><p className="text-sm font-semibold">{destination.label}</p><p className="mt-1 text-sm text-muted-foreground">{route ? `${(route.distanceMeters / 1000).toFixed(1)} km · ~${Math.max(1, Math.round(route.durationSeconds / 60))} min` : 'Calculando la mejor ruta…'}</p></div></div><strong className="text-2xl">{status === 'quoting' ? 'Cotizando…' : fareCents !== null ? formatMoney(fareCents) : 'Tarifa no disponible'}</strong></div></>}{error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<button disabled={!destination || !route || fareCents === null || status !== 'idle'} onClick={requestRide} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{status === 'requesting' ? 'Confirmando…' : 'Confirmar viaje'} <ArrowRight aria-hidden="true" /></button><p className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="size-3.5 text-primary" />La tarifa y la solicitud se validan de forma segura.</p></section></div>
}

export type { Place }

'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, LocateFixed, MapPin, Navigation, Search, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MapboxMap, type Coordinates, type RouteGeometry } from '@/components/map/mapbox-map'
import { FORMOSA_CENTER } from '@/lib/geolocation/service-area'

type Place = Coordinates & { id: string; label: string }
type ServiceType = 'BEARGO' | 'BEARGO_PLUS' | 'BEARGO_GREEN'
type CalculatedRoute = { distanceMeters: number; durationSeconds: number; geometry: RouteGeometry }

const initialOrigin: Place = { id: 'formosa-center', label: 'Centro de Formosa', latitude: FORMOSA_CENTER[1], longitude: FORMOSA_CENTER[0] }
const services: Array<{ id: ServiceType; name: string; description: string }> = [
  { id: 'BEARGO', name: 'BearRide', description: 'Viaje rápido y práctico' },
  { id: 'BEARGO_PLUS', name: 'Plus', description: 'Más espacio para viajar' },
  { id: 'BEARGO_GREEN', name: 'Green', description: 'Una opción más consciente' },
]

function money(cents: number) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cents / 100) }

export function RideRequest() {
  const [origin, setOrigin] = useState<Place>(initialOrigin)
  const [destination, setDestination] = useState<Place | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(false)
  const [route, setRoute] = useState<CalculatedRoute | null>(null)
  const [service, setService] = useState<ServiceType>('BEARGO')
  const [fareCents, setFareCents] = useState<number | null>(null)
  const [phase, setPhase] = useState<'ready' | 'locating' | 'calculating' | 'requesting' | 'confirmed'>('ready')
  const [error, setError] = useState('')

  useEffect(() => {
    if (query.trim().length < 3 || destination?.label === query) { setResults([]); return }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        const data = await response.json()
        setResults(response.ok ? data.results ?? [] : [])
      } catch { if (!controller.signal.aborted) setResults([]) } finally { if (!controller.signal.aborted) setSearching(false) }
    }, 350)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [query, destination?.label])

  useEffect(() => {
    if (!destination) { setRoute(null); setFareCents(null); return }
    const controller = new AbortController()
    setPhase('calculating'); setError('')
    void (async () => {
      try {
        const params = new URLSearchParams({ pickupLng: String(origin.longitude), pickupLat: String(origin.latitude), destinationLng: String(destination.longitude), destinationLat: String(destination.latitude) })
        const routeResponse = await fetch(`/api/route?${params}`, { signal: controller.signal })
        const routeData = await routeResponse.json()
        if (!routeResponse.ok) throw new Error(routeData.error ?? 'No pudimos calcular la ruta.')
        const nextRoute = routeData as CalculatedRoute
        setRoute(nextRoute)
        const { data, error: quoteError } = await createClient().rpc('quote_ride', { p_pickup_lat: origin.latitude, p_pickup_lng: origin.longitude, p_service_type: service, p_distance_meters: nextRoute.distanceMeters, p_duration_seconds: nextRoute.durationSeconds })
        if (quoteError) throw quoteError
        const quote = Array.isArray(data) ? data[0] : data
        if (!quote?.fare_cents) throw new Error('No hay una tarifa activa para este recorrido.')
        setFareCents(quote.fare_cents)
      } catch (cause) { if (!controller.signal.aborted) { setRoute(null); setFareCents(null); setError(cause instanceof Error ? cause.message : 'No pudimos cotizar el viaje.') } } finally { if (!controller.signal.aborted) setPhase('ready') }
    })()
    return () => controller.abort()
  }, [destination, origin, service])

  const chooseDestination = (place: Place) => { setDestination(place); setQuery(place.label); setResults([]) }
  const chooseMapPoint = (point: Coordinates) => chooseDestination({ id: `map-${point.latitude}-${point.longitude}`, label: 'Punto seleccionado en el mapa', ...point })
  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('Tu navegador no permite compartir ubicación. Elegí un punto en el mapa.'); return }
    setPhase('locating'); setError('')
    navigator.geolocation.getCurrentPosition((position) => { setOrigin({ id: 'my-location', label: 'Tu ubicación actual', latitude: position.coords.latitude, longitude: position.coords.longitude }); setPhase('ready') }, () => { setError('No pudimos acceder a tu ubicación. Revisá los permisos o elegí un punto en el mapa.'); setPhase('ready') }, { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 })
  }
  const requestRide = async () => {
    if (!destination || !route || fareCents === null) return
    setPhase('requesting'); setError('')
    const { error: requestError } = await createClient().rpc('create_ride_request', { p_pickup_lat: origin.latitude, p_pickup_lng: origin.longitude, p_pickup_address: origin.label, p_destination_lat: destination.latitude, p_destination_lng: destination.longitude, p_destination_address: destination.label, p_service_type: service, p_distance_meters: route.distanceMeters, p_duration_seconds: route.durationSeconds })
    if (requestError) { setError(requestError.message); setPhase('ready'); return }
    setPhase('confirmed')
  }

  if (phase === 'confirmed') return <section className="mx-auto flex max-w-xl flex-col gap-5 rounded-[2rem] border border-border bg-card p-7 shadow-xl shadow-[#123f3a]/10"><span className="flex size-14 items-center justify-center rounded-2xl bg-primary/20 text-primary"><CheckCircle2 className="size-7" /></span><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Solicitud confirmada</p><h2 className="mt-2 font-serif text-4xl">Buscando tu conductor</h2></div><p className="leading-7 text-muted-foreground">Te avisaremos cuando alguien acepte el viaje. El seguimiento va a estar disponible en tus viajes.</p><a href="/passenger/history" className="rounded-xl bg-primary px-5 py-3 text-center font-bold text-primary-foreground">Ver mis viajes</a></section>

  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,.75fr)]"><div className="min-h-[26rem] lg:min-h-[40rem]"><MapboxMap origin={origin} destination={destination} route={route?.geometry} onLocation={chooseMapPoint} /></div><section className="flex flex-col gap-5 rounded-[2rem] border border-border bg-card p-5 shadow-xl shadow-[#123f3a]/5 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Planificá tu viaje</p><h2 className="mt-2 font-serif text-4xl text-balance">¿A dónde vamos?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Primero elegí origen y destino. Te mostramos la ruta y tarifa antes de confirmar.</p></div><div className="grid grid-cols-[auto_1fr] gap-x-3"><span className="mt-4 size-3 rounded-full border-[3px] border-primary bg-card" /><button type="button" onClick={useMyLocation} disabled={phase === 'locating'} className="rounded-xl border border-border px-4 py-3 text-left transition hover:border-primary disabled:opacity-60"><small className="block text-muted-foreground">Punto de partida</small><strong className="mt-1 block text-sm">{phase === 'locating' ? 'Buscando tu ubicación…' : origin.label}</strong></button><span className="mx-auto h-4 border-l-2 border-dashed border-border" /><span /><MapPin className="mt-4 size-4 text-primary" /><div className="relative"><label htmlFor="destination" className="sr-only">Buscá un destino</label><Search className="pointer-events-none absolute left-4 top-4 size-4 text-muted-foreground" /><input id="destination" value={query} onChange={(event) => { setQuery(event.target.value); setDestination(null) }} placeholder="Buscá una dirección o lugar" autoComplete="off" className="min-h-12 w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />{(searching || results.length > 0) && <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl">{searching && <p className="p-3 text-sm text-muted-foreground">Buscando direcciones…</p>}{results.map((place) => <button type="button" key={place.id} onClick={() => chooseDestination(place)} className="w-full rounded-xl p-3 text-left text-sm transition hover:bg-secondary"><strong className="block">{place.label}</strong><span className="mt-1 block text-xs text-muted-foreground">Formosa</span></button>)}</div>}</div></div>{destination && <><div className="grid gap-2 sm:grid-cols-3">{services.map((option) => <button key={option.id} type="button" onClick={() => setService(option.id)} className={`rounded-xl border p-3 text-left transition ${option.id === service ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border hover:border-primary'}`}><strong className="block text-sm">{option.name}</strong><span className="mt-1 block text-xs leading-4 text-muted-foreground">{option.description}</span></button>)}</div><div className="rounded-2xl bg-[#123f3a] p-5 text-background"><div className="flex items-start gap-3"><Navigation className="mt-0.5 size-5 text-primary" /><div><p className="font-semibold">{destination.label}</p><p className="mt-1 text-sm text-background/70">{route ? `${(route.distanceMeters / 1000).toFixed(1)} km · ${Math.max(1, Math.round(route.durationSeconds / 60))} min estimados` : 'Calculando tu recorrido…'}</p></div></div><div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4"><span className="text-xs font-bold uppercase tracking-[.14em] text-background/60">Tarifa estimada</span><strong className="font-serif text-3xl">{phase === 'calculating' ? '…' : fareCents === null ? 'No disponible' : money(fareCents)}</strong></div></div></>}{error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<button disabled={!destination || !route || fareCents === null || phase !== 'ready'} onClick={requestRide} className="mt-auto flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{phase === 'requesting' ? 'Confirmando viaje…' : 'Confirmar viaje'} <ArrowRight className="size-4" /></button><p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />La ruta, la tarifa y la solicitud se validan antes de crear el viaje.</p></section></div>
}

export type { Place }

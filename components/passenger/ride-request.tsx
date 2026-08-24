'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, LocateFixed, Search, Sparkles } from 'lucide-react'
import { MapboxMap, type Coordinates } from '@/components/map/mapbox-map'

type Place = { id: number; label: string; latitude: number; longitude: number }
const fallback: Place = { id: 0, label: 'Ubicación en Formosa', latitude: -26.1775, longitude: -58.1754 }

function distanceKm(a: Coordinates, b: Coordinates) { const dLat = (b.latitude - a.latitude) * 111; const dLon = (b.longitude - a.longitude) * 99; return Math.max(1, Math.sqrt(dLat * dLat + dLon * dLon)) }

export function RideRequest() {
  const [origin, setOrigin] = useState<Place | null>(null)
  const [destination, setDestination] = useState<Place | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(false)
  const [mapPoint, setMapPoint] = useState<Coordinates | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => { if (query.trim().length < 3) { setResults([]); return }; const timer = window.setTimeout(async () => { setSearching(true); try { const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`); const data = await response.json(); setResults(data.results ?? []) } finally { setSearching(false) } }, 500); return () => window.clearTimeout(timer) }, [query])
  const currentOrigin = origin ?? fallback
  const km = destination ? distanceKm(currentOrigin, destination) : 0
  const fare = Math.round((700 + km * 420) / 10) * 10
  const chooseDestination = (place: Place) => { setDestination(place); setQuery(place.label); setResults([]) }
  const chooseMapPoint = (point: Coordinates) => { setMapPoint(point); setDestination({ id: Date.now(), label: 'Punto elegido en el mapa', ...point }) }

  if (confirmed) return <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm"><div className="flex size-12 items-center justify-center rounded-2xl bg-primary/20 text-primary"><Sparkles /></div><h2 className="font-serif text-3xl">Solicitud enviada</h2><p className="text-muted-foreground">Estamos buscando un conductor cerca de vos. Podés seguir el estado desde Tus viajes.</p><button className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground" onClick={() => setConfirmed(false)}>Nueva solicitud</button></section>
  return <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><section className="order-2 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm lg:order-1"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Viaje urbano</p><h2 className="mt-1 font-serif text-3xl">¿A dónde vamos?</h2></div><div className="flex flex-col gap-3"><button className="flex items-center gap-3 rounded-2xl border border-border p-4 text-left" onClick={() => setOrigin(fallback)}><LocateFixed className="text-primary" /><span><small className="block text-muted-foreground">Partida</small><strong>{origin?.label ?? 'Usar mi ubicación en Formosa'}</strong></span></button><div className="relative"><Search className="absolute left-4 top-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscá una dirección o lugar" className="w-full rounded-2xl border border-border bg-background py-4 pl-11 pr-4 outline-none focus:ring-2 focus:ring-ring" />{(searching || results.length > 0) && <div className="absolute inset-x-0 top-full z-10 mt-2 flex flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-lg">{searching && <p className="p-3 text-sm text-muted-foreground">Buscando en Formosa…</p>}{results.map((place) => <button key={place.id} className="rounded-xl p-3 text-left text-sm hover:bg-secondary" onClick={() => chooseDestination(place)}>{place.label}</button>)}</div>}</div></div>{destination && <div className="rounded-2xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Estimación</p><div className="mt-1 flex items-end justify-between"><strong className="text-2xl">${fare.toLocaleString('es-AR')}</strong><span className="text-sm text-muted-foreground">{km.toFixed(1)} km · ~{Math.max(5, Math.round(km * 3))} min</span></div></div>}<button disabled={!destination} onClick={() => setConfirmed(true)} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">Confirmar viaje <ArrowRight data-icon="inline-end" /></button></section><div className="order-1 lg:order-2"><MapboxMap onLocation={chooseMapPoint} /><p className="mt-2 text-xs text-muted-foreground">Mapa libre con datos de OpenStreetMap. {mapPoint ? 'Destino seleccionado.' : 'También podés tocar el mapa.'}</p></div></div>
}

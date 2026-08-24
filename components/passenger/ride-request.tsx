'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, LocateFixed, MapPin, Search, Sparkles } from 'lucide-react'
import { MapboxMap, type Coordinates } from '@/components/map/mapbox-map'

type Place = { id: number; label: string; latitude: number; longitude: number }

const fallback: Place = { id: 0, label: 'Ubicación en Formosa', latitude: -26.1775, longitude: -58.1754 }

function distanceKm(a: Coordinates, b: Coordinates) {
  const dLat = (b.latitude - a.latitude) * 111
  const dLon = (b.longitude - a.longitude) * 99
  return Math.max(1, Math.sqrt(dLat * dLat + dLon * dLon))
}

export function RideRequest() {
  const [origin, setOrigin] = useState<Place | null>(null)
  const [destination, setDestination] = useState<Place | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const currentOrigin = origin ?? fallback
  const distance = destination ? distanceKm(currentOrigin, destination) : 0
  const fare = Math.round((700 + distance * 420) / 10) * 10

  useEffect(() => {
    if (query.trim().length < 3 || destination?.label === query) {
      setResults([])
      return
    }
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 450)
    return () => window.clearTimeout(timer)
  }, [query, destination?.label])

  const chooseDestination = (place: Place) => {
    setDestination(place)
    setQuery(place.label)
    setResults([])
  }

  const chooseMapPoint = (point: Coordinates) => {
    const place = { id: Date.now(), label: 'Punto elegido en el mapa', ...point }
    setDestination(place)
    setQuery(place.label)
  }

  if (confirmed) {
    return (
      <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/20 text-primary"><Sparkles aria-hidden="true" /></div>
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Demo de solicitud</p><h2 className="mt-2 font-serif text-3xl text-balance">Solicitud enviada</h2></div>
        <p className="leading-relaxed text-muted-foreground">Estamos buscando un conductor cerca de vos. Podés seguir el estado desde Tus viajes.</p>
        <button className="min-h-12 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90" onClick={() => setConfirmed(false)}>Nueva solicitud</button>
      </section>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.85fr)]">
      <div className="order-1 min-h-[22rem] overflow-hidden rounded-3xl border border-border bg-secondary shadow-sm lg:order-2 lg:min-h-[34rem]"><MapboxMap destination={destination} onLocation={chooseMapPoint} /></div>
      <section className="order-2 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm lg:order-1 lg:p-6">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Viaje urbano · Demo</p><h2 className="mt-1 font-serif text-3xl text-balance">¿A dónde vamos?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Elegí una dirección o tocá el mapa para marcar tu destino.</p></div>
        <button className="flex min-h-16 items-center gap-3 rounded-2xl border border-border p-4 text-left transition hover:border-primary" onClick={() => setOrigin(fallback)}><LocateFixed className="text-primary" aria-hidden="true" /><span><small className="block text-muted-foreground">Partida</small><strong>{origin?.label ?? 'Usar mi ubicación en Formosa'}</strong></span></button>
        <div className="relative"><label htmlFor="destination" className="sr-only">Buscar destino</label><Search className="pointer-events-none absolute left-4 top-4 text-muted-foreground" aria-hidden="true" /><input id="destination" value={query} onChange={(event) => { setQuery(event.target.value); setDestination(null) }} placeholder="Buscá una dirección o lugar" autoComplete="off" className="min-h-14 w-full rounded-2xl border border-border bg-background py-4 pl-11 pr-4 outline-none focus:ring-2 focus:ring-ring" />{(searching || results.length > 0) && <div className="absolute inset-x-0 top-full z-10 mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-lg" role="listbox">{searching && <p className="p-3 text-sm text-muted-foreground">Buscando en Formosa…</p>}{!searching && results.length === 0 && <p className="p-3 text-sm text-muted-foreground">No encontramos esa dirección.</p>}{results.map((place) => <button type="button" key={place.id} className="rounded-xl p-3 text-left text-sm transition hover:bg-secondary" onClick={() => chooseDestination(place)}>{place.label}</button>)}</div>}</div>
        {destination && <div className="flex flex-col gap-3 rounded-2xl bg-secondary p-4"><div className="flex items-start gap-3"><MapPin className="mt-0.5 text-primary" aria-hidden="true" /><div><p className="text-sm font-semibold">{destination.label}</p><p className="mt-1 text-sm text-muted-foreground">Tarifa estimada · {distance.toFixed(1)} km · ~{Math.max(5, Math.round(distance * 3))} min</p></div></div><strong className="text-2xl">${fare.toLocaleString('es-AR')}</strong></div>}
        <button disabled={!destination} onClick={() => setConfirmed(true)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">Confirmar viaje <ArrowRight aria-hidden="true" /></button>
      </section>
    </div>
  )
}

export type { Place }

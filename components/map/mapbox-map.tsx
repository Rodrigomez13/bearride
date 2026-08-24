'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { CarFront, LocateFixed } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Coordinates = { latitude: number; longitude: number }
type Driver = Coordinates & { id: string; name: string; eta: number; rating: number; vehicle: string }

const FORMOSA: [number, number] = [-58.1754, -26.1775]
const DRIVERS: Driver[] = [
  { id: 'br-101', name: 'Marcos', latitude: -26.171, longitude: -58.181, eta: 3, rating: 4.9, vehicle: 'Toyota Etios · Gris' },
  { id: 'br-204', name: 'Lucía', latitude: -26.184, longitude: -58.166, eta: 5, rating: 4.8, vehicle: 'Fiat Cronos · Blanco' },
  { id: 'br-315', name: 'Julián', latitude: -26.165, longitude: -58.168, eta: 7, rating: 4.7, vehicle: 'Renault Logan · Azul' },
  { id: 'br-422', name: 'Sofía', latitude: -26.191, longitude: -58.184, eta: 8, rating: 4.9, vehicle: 'Chevrolet Onix · Negro' },
]

export function MapboxMap({ onLocation, destination }: { onLocation?: (coordinates: Coordinates) => void; destination?: Coordinates | null }) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('maplibre-gl').Map | null>(null)
  const markersRef = useRef<import('maplibre-gl').Marker[]>([])
  const [message, setMessage] = useState('Cargando mapa de Formosa…')

  useEffect(() => {
    if (!container.current) return
    let disposed = false
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      if (disposed || !container.current) return
      const map = new maplibregl.Map({ container: container.current, style: 'https://tiles.openfreemap.org/styles/liberty', center: FORMOSA, zoom: 12, attributionControl: false })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
      DRIVERS.forEach((driver) => {
        const element = document.createElement('div')
        element.className = 'flex size-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-lg'
        element.setAttribute('aria-label', `Conductor ${driver.name}`)
        element.innerHTML = '<span style="font-size:9px;font-weight:700;letter-spacing:-.04em">CAR</span>'
        new maplibregl.Marker({ element }).setLngLat([driver.longitude, driver.latitude]).setPopup(new maplibregl.Popup({ offset: 22 }).setHTML(`<strong>${driver.name}</strong><br/>${driver.vehicle}<br/>★ ${driver.rating} · ${driver.eta} min`)).addTo(map)
      })
      map.on('load', () => setMessage(`${DRIVERS.length} conductores cerca · Tocá el mapa para elegir`))
      map.on('click', (event) => onLocation?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng }))
      mapRef.current = map
    }).catch(() => setMessage('No fue posible cargar el mapa. Revisá tu conexión.'))
    return () => { disposed = true; markersRef.current.forEach((marker) => marker.remove()); mapRef.current?.remove(); mapRef.current = null }
  }, [onLocation])

  useEffect(() => {
    if (!mapRef.current || !destination) return
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      markersRef.current.forEach((marker) => marker.remove())
      const element = document.createElement('div')
      element.className = 'flex size-8 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground shadow-lg'
      element.innerHTML = '<span style="font-size:16px">●</span>'
      markersRef.current = [new maplibregl.Marker({ element }).setLngLat([destination.longitude, destination.latitude]).addTo(mapRef.current!)]
      mapRef.current?.flyTo({ center: [destination.longitude, destination.latitude], zoom: 14, duration: 800 })
    })
  }, [destination])

  return <div className="relative min-h-80 overflow-hidden rounded-2xl border border-border bg-secondary"><div ref={container} className="absolute inset-0" /><div className="absolute left-3 top-3 flex items-center gap-2 rounded-xl bg-card/95 px-3 py-2 text-xs font-semibold shadow-sm"><CarFront className="size-4 text-primary" />{DRIVERS.length} disponibles</div><p className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-card/95 px-3 py-2 text-xs font-semibold shadow-sm"><LocateFixed className="size-3 text-primary" />{message}</p></div>
}

export type { Coordinates, Driver }
export { DRIVERS }

'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { LocateFixed, Navigation } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Coordinates = { latitude: number; longitude: number }
type Driver = Coordinates & { id: string; name: string; eta: number; rating: number; vehicle: string }
type RouteGeometry = { coordinates: [number, number][] }

const FORMOSA: [number, number] = [-58.1754, -26.1775]
const DRIVERS: Driver[] = [
  { id: 'br-101', name: 'Marcos', latitude: -26.171, longitude: -58.181, eta: 3, rating: 4.9, vehicle: 'Toyota Etios · Gris' },
  { id: 'br-204', name: 'Lucía', latitude: -26.184, longitude: -58.166, eta: 5, rating: 4.8, vehicle: 'Fiat Cronos · Blanco' },
  { id: 'br-315', name: 'Julián', latitude: -26.165, longitude: -58.168, eta: 7, rating: 4.7, vehicle: 'Renault Logan · Azul' },
  { id: 'br-422', name: 'Sofía', latitude: -26.191, longitude: -58.184, eta: 8, rating: 4.9, vehicle: 'Chevrolet Onix · Negro' },
]

export function MapboxMap({ onLocation, destination, origin, route }: { onLocation?: (coordinates: Coordinates) => void; destination?: Coordinates | null; origin?: Coordinates | null; route?: RouteGeometry | null }) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('maplibre-gl').Map | null>(null)
  const markersRef = useRef<import('maplibre-gl').Marker[]>([])
  const destinationMarkerRef = useRef<import('maplibre-gl').Marker | null>(null)
  const originMarkerRef = useRef<import('maplibre-gl').Marker | null>(null)
  const [message, setMessage] = useState('Cargando mapa de Formosa…')

  useEffect(() => {
    if (!container.current) return
    let disposed = false
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      if (disposed || !container.current) return
      const map = new maplibregl.Map({
        container: container.current,
        center: FORMOSA,
        zoom: 12,
        attributionControl: false,
        style: 'https://tiles.openfreemap.org/styles/liberty',
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
      map.on('error', () => setMessage('No se pudo cargar el mapa. Reintentá en unos segundos.'))
      markersRef.current = DRIVERS.map((driver) => {
        const element = document.createElement('button')
        element.type = 'button'
        element.title = `Conductor ${driver.name}`
        element.setAttribute('aria-label', `Ver información de ${driver.name}`)
        element.className = 'flex size-10 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-lg'
        element.innerHTML = '<span style="font-size:9px;font-weight:700;letter-spacing:-.04em">CAR</span>'
        return new maplibregl.Marker({ element }).setLngLat([driver.longitude, driver.latitude]).setPopup(new maplibregl.Popup({ offset: 22 }).setHTML(`<strong>${driver.name}</strong><br/>${driver.vehicle}<br/>★ ${driver.rating} · ${driver.eta} min`)).addTo(map)
      })
      map.on('load', () => setMessage('Mapa listo · Elegí un punto para tu destino'))
      map.on('click', (event) => onLocation?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng }))
      mapRef.current = map
    }).catch(() => setMessage('No fue posible cargar el mapa. Revisá tu conexión.'))
    return () => { disposed = true; markersRef.current.forEach((marker) => marker.remove()); destinationMarkerRef.current?.remove(); originMarkerRef.current?.remove(); mapRef.current?.remove(); mapRef.current = null }
  }, [onLocation])

  useEffect(() => {
    if (!mapRef.current || !destination) return
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      destinationMarkerRef.current?.remove()
      const element = document.createElement('div')
      element.className = 'flex size-8 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground shadow-lg'
      element.innerHTML = '<span style="font-size:16px">●</span>'
      destinationMarkerRef.current = new maplibregl.Marker({ element }).setLngLat([destination.longitude, destination.latitude]).addTo(mapRef.current!)
      mapRef.current?.flyTo({ center: [destination.longitude, destination.latitude], zoom: 14, duration: 800 })
    })
  }, [destination])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !origin) return
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      originMarkerRef.current?.remove()
      const element = document.createElement('div')
      element.className = 'size-4 rounded-full border-4 border-card bg-primary shadow-lg'
      originMarkerRef.current = new maplibregl.Marker({ element }).setLngLat([origin.longitude, origin.latitude]).addTo(map)
    })
  }, [origin])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const sourceId = 'ride-route'
    const layerId = 'ride-route-line'
    const render = () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      if (!route?.coordinates?.length) return
      map.addSource(sourceId, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.coordinates } } })
      map.addLayer({ id: layerId, type: 'line', source: sourceId, paint: { 'line-color': '#17665d', 'line-width': 5, 'line-opacity': .9 } })
    }
    if (map.isStyleLoaded()) render(); else map.once('load', render)
    return () => { if (map.getLayer(layerId)) map.removeLayer(layerId); if (map.getSource(sourceId)) map.removeSource(sourceId) }
  }, [route])

  return <div className="relative min-h-80 overflow-hidden rounded-[2rem] border border-white/60 bg-secondary shadow-2xl shadow-primary/10"><div ref={container} className="absolute inset-0" /><div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/80 bg-card/95 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur"><Navigation className="size-3.5 text-primary" />Viaje seguro</div><p className="absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl bg-foreground/90 px-3 py-2 text-xs font-medium text-background shadow-lg backdrop-blur"><LocateFixed className="size-3.5 shrink-0 text-primary" />{message}</p></div>
}

export type { Coordinates, Driver }
export { DRIVERS }

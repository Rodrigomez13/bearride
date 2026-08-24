'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { LocateFixed, Navigation } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FORMOSA_CENTER } from '@/lib/geolocation/service-area'

type Coordinates = { latitude: number; longitude: number }
type RouteGeometry = { coordinates: [number, number][] }

export function MapboxMap({ onLocation, origin, destination, route }: { onLocation?: (coordinates: Coordinates) => void; origin?: Coordinates | null; destination?: Coordinates | null; route?: RouteGeometry | null }) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('maplibre-gl').Map | null>(null)
  const onLocationRef = useRef(onLocation)
  const originMarkerRef = useRef<import('maplibre-gl').Marker | null>(null)
  const destinationMarkerRef = useRef<import('maplibre-gl').Marker | null>(null)
  const [message, setMessage] = useState('Cargando mapa de Formosa…')
  onLocationRef.current = onLocation

  useEffect(() => {
    if (!container.current) return
    let disposed = false
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      if (disposed || !container.current) return
      const map = new maplibregl.Map({ container: container.current, center: FORMOSA_CENTER, zoom: 13, attributionControl: false, style: 'https://tiles.openfreemap.org/styles/liberty' })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
      map.on('load', () => setMessage('Mapa listo · Tocá para marcar tu destino'))
      map.on('error', () => setMessage('No pudimos cargar el mapa. Reintentá en unos segundos.'))
      map.on('click', (event) => onLocationRef.current?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng }))
      mapRef.current = map
    }).catch(() => setMessage('No fue posible iniciar el mapa.'))
    return () => { disposed = true; originMarkerRef.current?.remove(); destinationMarkerRef.current?.remove(); mapRef.current?.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !origin) return
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      originMarkerRef.current?.remove()
      const element = document.createElement('div')
      element.className = 'size-5 rounded-full border-4 border-card bg-primary shadow-lg'
      originMarkerRef.current = new maplibregl.Marker({ element }).setLngLat([origin.longitude, origin.latitude]).addTo(map)
    })
  }, [origin])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !destination) return
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      destinationMarkerRef.current?.remove()
      const element = document.createElement('div')
      element.className = 'flex size-10 items-center justify-center rounded-full border-4 border-card bg-[#163f3a] text-base text-white shadow-xl'
      element.textContent = '●'
      destinationMarkerRef.current = new maplibregl.Marker({ element }).setLngLat([destination.longitude, destination.latitude]).addTo(map)
      map.flyTo({ center: [destination.longitude, destination.latitude], zoom: 14, duration: 700 })
    })
  }, [destination])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const sourceId = 'ride-route'; const layerId = 'ride-route-line'
    const render = () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      if (!route?.coordinates?.length) return
      map.addSource(sourceId, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.coordinates } } })
      map.addLayer({ id: layerId, type: 'line', source: sourceId, paint: { 'line-color': '#f3bb15', 'line-width': 6, 'line-opacity': .95 } })
    }
    if (map.isStyleLoaded()) render(); else map.once('load', render)
    return () => { if (map.getLayer(layerId)) map.removeLayer(layerId); if (map.getSource(sourceId)) map.removeSource(sourceId) }
  }, [route])

  return <div className="relative min-h-80 overflow-hidden rounded-[2rem] border border-white/70 bg-secondary shadow-2xl shadow-[#123f3a]/10"><div ref={container} className="absolute inset-0" /><div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/80 bg-card/95 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur"><Navigation className="size-3.5 text-primary" />Elegí tu destino</div><p className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-foreground/90 px-3 py-2 text-xs font-medium text-background shadow-lg backdrop-blur"><LocateFixed className="size-3.5 shrink-0 text-primary" />{message}</p></div>
}

export type { Coordinates, RouteGeometry }

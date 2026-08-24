'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'

type Coordinates = { latitude: number; longitude: number }

const FORMOSA: [number, number] = [-58.1754, -26.1775]

export function MapboxMap({ onLocation }: { onLocation?: (coordinates: Coordinates) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('maplibre-gl').Map | null>(null)
  const [message, setMessage] = useState('Cargando mapa de Formosa…')

  useEffect(() => {
    if (!container.current) return
    let disposed = false
    void import('maplibre-gl').then(({ default: maplibregl }) => {
      if (disposed || !container.current) return
      const map = new maplibregl.Map({
        container: container.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: FORMOSA,
        zoom: 12,
        attributionControl: false,
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
      map.on('load', () => setMessage('Formosa, Argentina · Tocá el mapa para elegir'))
      map.on('click', (event) => onLocation?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng }))
      mapRef.current = map
    }).catch(() => setMessage('No fue posible cargar el mapa. Revisá tu conexión.'))
    return () => { disposed = true; mapRef.current?.remove(); mapRef.current = null }
  }, [onLocation])

  return <div className="relative min-h-72 overflow-hidden rounded-2xl border border-border bg-secondary"><div ref={container} className="absolute inset-0" /><p className="absolute bottom-3 left-3 rounded-lg bg-card/95 px-3 py-2 text-xs font-semibold shadow-sm">{message}</p></div>
}

export type { Coordinates }

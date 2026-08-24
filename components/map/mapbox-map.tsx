'use client'

import { useEffect, useRef, useState } from 'react'

type Coordinates = { latitude: number; longitude: number }

export function MapboxMap({ onLocation }: { onLocation?: (coordinates: Coordinates) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('mapbox-gl').Map | null>(null)
  const [message, setMessage] = useState('Cargando mapa…')

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || !container.current) {
      setMessage('Mapbox aún no está configurado.')
      return
    }
    let disposed = false
    void import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (disposed || !container.current) return
      mapboxgl.accessToken = token
      const map = new mapboxgl.Map({ container: container.current, style: 'mapbox://styles/mapbox/streets-v12', center: [-58.1754, -26.1775], zoom: 12 })
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.on('load', () => setMessage('Formosa, Argentina'))
      map.on('click', (event) => onLocation?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng }))
      mapRef.current = map
    }).catch(() => setMessage('No fue posible cargar el mapa.'))
    return () => { disposed = true; mapRef.current?.remove(); mapRef.current = null }
  }, [onLocation])

  return <div className="relative min-h-72 overflow-hidden rounded-2xl border border-border bg-secondary"><div ref={container} className="absolute inset-0" /><p className="absolute bottom-3 left-3 rounded-lg bg-card/95 px-3 py-2 text-xs font-semibold shadow-sm">{message}</p></div>
}

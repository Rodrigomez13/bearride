import { NextResponse } from 'next/server'

const FORMOSA_BOUNDS = { south: -27.2, north: -25.2, west: -59.2, east: -57.1 }

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim()
  if (!query || query.length < 3 || query.length > 120) return NextResponse.json({ error: 'Consulta inválida.' }, { status: 400 })
  const params = new URLSearchParams({ format: 'jsonv2', q: `${query}, Formosa, Argentina`, limit: '5', addressdetails: '1', countrycodes: 'ar' })
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { Accept: 'application/json', 'User-Agent': 'BearGo/1.0 (contacto@beargo.app)' }, next: { revalidate: 60 } })
  if (!response.ok) return NextResponse.json({ error: 'El buscador no está disponible.' }, { status: 502 })
  const data = await response.json() as Array<{ place_id: number; display_name: string; lat: string; lon: string }>
  const results = data.filter((place) => { const lat = Number(place.lat); const lon = Number(place.lon); return lat >= FORMOSA_BOUNDS.south && lat <= FORMOSA_BOUNDS.north && lon >= FORMOSA_BOUNDS.west && lon <= FORMOSA_BOUNDS.east }).map((place) => ({ id: place.place_id, label: place.display_name.split(',').slice(0, 3).join(','), latitude: Number(place.lat), longitude: Number(place.lon) }))
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
}

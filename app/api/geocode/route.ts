import { NextResponse } from 'next/server'

const FORMOSA_BOUNDS = { south: -27.2, north: -25.2, west: -59.2, east: -57.1 }

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim()
  if (!query || query.length < 3 || query.length > 120) return NextResponse.json({ error: 'Consulta inválida.' }, { status: 400 })
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'El buscador de direcciones todavía no está configurado.' }, { status: 503 })
  const params = new URLSearchParams({
    q: query,
    country: 'AR',
    language: 'es',
    limit: '5',
    autocomplete: 'true',
    bbox: `${FORMOSA_BOUNDS.west},${FORMOSA_BOUNDS.south},${FORMOSA_BOUNDS.east},${FORMOSA_BOUNDS.north}`,
    access_token: token,
  })
  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { next: { revalidate: 60 } })
  if (!response.ok) return NextResponse.json({ error: 'El buscador no está disponible.' }, { status: 502 })
  const data = await response.json() as { features?: Array<{ id: string; geometry?: { coordinates?: [number, number] }; properties?: { full_address?: string; place_formatted?: string }; name_preferred?: string }> }
  const results = (data.features ?? []).flatMap((place) => {
    const [longitude, latitude] = place.geometry?.coordinates ?? []
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return []
    return [{ id: place.id, label: place.properties?.full_address ?? [place.name_preferred, place.properties?.place_formatted].filter(Boolean).join(', '), latitude, longitude }]
  })
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
}

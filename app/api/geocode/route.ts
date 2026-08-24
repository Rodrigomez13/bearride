import { NextResponse } from 'next/server'

const FORMOSA_BOUNDS = { south: -27.2, north: -25.2, west: -59.2, east: -57.1 }

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim()
  if (!query || query.length < 3 || query.length > 120) return NextResponse.json({ error: 'Consulta inválida.' }, { status: 400 })
  const params = new URLSearchParams({ q: `${query}, Formosa, Argentina`, limit: '5', bbox: `${FORMOSA_BOUNDS.west},${FORMOSA_BOUNDS.south},${FORMOSA_BOUNDS.east},${FORMOSA_BOUNDS.north}` })
  const response = await fetch(`https://photon.komoot.io/api/?${params}`, { next: { revalidate: 60 } })
  if (!response.ok) return NextResponse.json({ error: 'El buscador no está disponible.' }, { status: 502 })
  const data = await response.json() as { features?: Array<{ properties?: { osm_id?: number; name?: string; street?: string; city?: string; district?: string; state?: string }; geometry?: { coordinates?: [number, number] } }> }
  const results = (data.features ?? []).flatMap((place) => {
    const [longitude, latitude] = place.geometry?.coordinates ?? []
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return []
    const label = [place.properties?.name ?? place.properties?.street, place.properties?.district ?? place.properties?.city, place.properties?.state].filter(Boolean).join(', ')
    return label ? [{ id: String(place.properties?.osm_id ?? `${latitude}-${longitude}`), label, latitude, longitude }] : []
  })
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
}

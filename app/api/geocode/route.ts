import { NextResponse } from 'next/server'
import { FORMOSA_BOUNDS, isInFormosa } from '@/lib/geolocation/service-area'

type PhotonFeature = { geometry?: { coordinates?: [number, number] }; properties?: { osm_id?: number; name?: string; street?: string; city?: string; district?: string; state?: string } }

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim()
  if (!query || query.length < 3 || query.length > 120) return NextResponse.json({ error: 'Ingresá al menos 3 caracteres.' }, { status: 400 })

  const params = new URLSearchParams({ q: `${query}, Formosa, Argentina`, limit: '5', bbox: `${FORMOSA_BOUNDS.west},${FORMOSA_BOUNDS.south},${FORMOSA_BOUNDS.east},${FORMOSA_BOUNDS.north}` })
  try {
    const response = await fetch(`https://photon.komoot.io/api/?${params}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8_000) })
    if (!response.ok) throw new Error(`photon ${response.status}`)
    const data = await response.json() as { features?: PhotonFeature[] }
    const results = (data.features ?? []).flatMap((feature) => {
      const [longitude, latitude] = feature.geometry?.coordinates ?? []
      if (typeof longitude !== 'number' || typeof latitude !== 'number' || !isInFormosa({ latitude, longitude })) return []
      const properties = feature.properties
      const label = [properties?.name ?? properties?.street, properties?.district ?? properties?.city, properties?.state].filter(Boolean).join(', ')
      return label ? [{ id: String(properties?.osm_id ?? `${latitude}-${longitude}`), label, latitude, longitude }] : []
    })
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch {
    return NextResponse.json({ error: 'El buscador no está disponible. Elegí un punto en el mapa.' }, { status: 502 })
  }
}

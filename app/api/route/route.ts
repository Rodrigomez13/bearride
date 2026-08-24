import { NextResponse } from 'next/server'
import { isInFormosa, readCoordinate } from '@/lib/geolocation/service-area'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pickupLng = readCoordinate(url.searchParams.get('pickupLng'), -180, 180)
  const pickupLat = readCoordinate(url.searchParams.get('pickupLat'), -90, 90)
  const destinationLng = readCoordinate(url.searchParams.get('destinationLng'), -180, 180)
  const destinationLat = readCoordinate(url.searchParams.get('destinationLat'), -90, 90)
  if (pickupLng === null || pickupLat === null || destinationLng === null || destinationLat === null) return NextResponse.json({ error: 'Coordenadas inválidas.' }, { status: 400 })
  const pickup = { longitude: pickupLng, latitude: pickupLat }
  const destination = { longitude: destinationLng, latitude: destinationLat }
  if (!isInFormosa(pickup) || !isInFormosa(destination)) return NextResponse.json({ error: 'Por ahora operamos dentro de Formosa.' }, { status: 422 })

  try {
    const coordinates = `${pickup.longitude},${pickup.latitude};${destination.longitude},${destination.latitude}`
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=false`, { cache: 'no-store', signal: AbortSignal.timeout(8_000) })
    if (!response.ok) throw new Error(`osrm ${response.status}`)
    const data = await response.json() as { routes?: Array<{ distance: number; duration: number; geometry: { coordinates: [number, number][] } }> }
    const route = data.routes?.[0]
    if (!route) return NextResponse.json({ error: 'No encontramos una ruta disponible.' }, { status: 404 })
    return NextResponse.json({ distanceMeters: Math.round(route.distance), durationSeconds: Math.round(route.duration), geometry: route.geometry })
  } catch {
    return NextResponse.json({ error: 'No pudimos calcular la ruta. Reintentá en unos segundos.' }, { status: 502 })
  }
}

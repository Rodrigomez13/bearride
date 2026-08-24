import { NextResponse } from 'next/server'

function coordinate(value: string | null, min: number, max: number) {
  const result = Number(value)
  return Number.isFinite(result) && result >= min && result <= max ? result : null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pickupLng = coordinate(url.searchParams.get('pickupLng'), -180, 180)
  const pickupLat = coordinate(url.searchParams.get('pickupLat'), -90, 90)
  const destinationLng = coordinate(url.searchParams.get('destinationLng'), -180, 180)
  const destinationLat = coordinate(url.searchParams.get('destinationLat'), -90, 90)
  if ([pickupLng, pickupLat, destinationLng, destinationLat].some((value) => value === null)) return NextResponse.json({ error: 'Coordenadas inválidas.' }, { status: 400 })

  const coordinates = `${pickupLng},${pickupLat};${destinationLng},${destinationLat}`
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=false`, { cache: 'no-store' })
  if (!response.ok) return NextResponse.json({ error: 'No pudimos calcular la ruta.' }, { status: 502 })
  const data = await response.json() as { routes?: Array<{ distance: number; duration: number; geometry: { coordinates: [number, number][] } }> }
  const route = data.routes?.[0]
  if (!route) return NextResponse.json({ error: 'No encontramos una ruta disponible.' }, { status: 404 })
  return NextResponse.json({ distanceMeters: Math.round(route.distance), durationSeconds: Math.round(route.duration), geometry: route.geometry })
}

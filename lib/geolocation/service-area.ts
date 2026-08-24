export type Coordinates = { latitude: number; longitude: number }

// Área inicial de operación. Las funciones SQL siguen siendo la autoridad final
// al momento de cotizar o crear una solicitud.
export const FORMOSA_BOUNDS = { south: -27.2, north: -25.2, west: -59.2, east: -57.1 }
export const FORMOSA_CENTER: [number, number] = [-58.1754, -26.1775]

export function isInFormosa(coordinates: Coordinates) {
  return coordinates.latitude >= FORMOSA_BOUNDS.south && coordinates.latitude <= FORMOSA_BOUNDS.north && coordinates.longitude >= FORMOSA_BOUNDS.west && coordinates.longitude <= FORMOSA_BOUNDS.east
}

export function readCoordinate(value: string | null, min: number, max: number) {
  const result = Number(value)
  return Number.isFinite(result) && result >= min && result <= max ? result : null
}

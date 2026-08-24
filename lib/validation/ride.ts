export type ServiceType = 'BEARGO' | 'BEARGO_PLUS' | 'BEARGO_GREEN'

type Location = { latitude: number; longitude: number; address: string }
export type RideQuoteInput = { serviceType: ServiceType; distanceMeters: number; durationSeconds: number }
export type CreateRideRequestInput = RideQuoteInput & { pickup: Location; destination: Location }

function validNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function validateRideQuote(input: RideQuoteInput) {
  if (!['BEARGO', 'BEARGO_PLUS', 'BEARGO_GREEN'].includes(input.serviceType)) return 'Tipo de servicio inválido.'
  if (!Number.isInteger(input.distanceMeters) || input.distanceMeters <= 0 || input.distanceMeters > 300_000) return 'Distancia inválida.'
  if (!Number.isInteger(input.durationSeconds) || input.durationSeconds <= 0 || input.durationSeconds > 43_200) return 'Duración inválida.'
  return null
}

export function validateCreateRideRequest(input: CreateRideRequestInput) {
  const quoteError = validateRideQuote(input)
  if (quoteError) return quoteError
  for (const location of [input.pickup, input.destination]) {
    if (!validNumber(location.latitude) || location.latitude < -90 || location.latitude > 90) return 'Latitud inválida.'
    if (!validNumber(location.longitude) || location.longitude < -180 || location.longitude > 180) return 'Longitud inválida.'
    if (location.address.trim().length < 3 || location.address.trim().length > 300) return 'Dirección inválida.'
  }
  return null
}

import { z } from 'zod'

const coordinate = z.number().finite()

export const rideQuoteSchema = z.object({
  serviceType: z.enum(['BEARGO', 'BEARGO_PLUS', 'BEARGO_GREEN']),
  distanceMeters: z.number().int().positive().max(300_000),
  durationSeconds: z.number().int().positive().max(43_200),
})

export const createRideRequestSchema = rideQuoteSchema.extend({
  pickup: z.object({ latitude: coordinate.gte(-90).lte(90), longitude: coordinate.gte(-180).lte(180), address: z.string().trim().min(3).max(300) }),
  destination: z.object({ latitude: coordinate.gte(-90).lte(90), longitude: coordinate.gte(-180).lte(180), address: z.string().trim().min(3).max(300) }),
})

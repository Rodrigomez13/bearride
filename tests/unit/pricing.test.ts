import { describe, expect, it } from 'vitest'
import { calculateFareCents } from '@/lib/pricing/calculate-fare'

describe('calculateFareCents', () => {
  const rule = { baseFareCents: 1_000, pricePerKmCents: 500, pricePerMinuteCents: 100, minimumFareCents: 1_500, bookingFeeCents: 100, multiplier: 1 }
  it('uses distance, duration and booking fee', () => expect(calculateFareCents(rule, 2_000, 600)).toBe(3_100))
  it('honors the minimum fare', () => expect(calculateFareCents(rule, 100, 1)).toBe(1_600))
})

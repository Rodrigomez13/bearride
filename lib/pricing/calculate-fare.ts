export type PricingRule = { baseFareCents: number; pricePerKmCents: number; pricePerMinuteCents: number; minimumFareCents: number; bookingFeeCents: number; multiplier: number }

export function calculateFareCents(rule: PricingRule, distanceMeters: number, durationSeconds: number) {
  const variableFare = rule.baseFareCents + (distanceMeters / 1_000) * rule.pricePerKmCents + (durationSeconds / 60) * rule.pricePerMinuteCents
  return Math.round(Math.max(rule.minimumFareCents, variableFare * rule.multiplier) + rule.bookingFeeCents)
}

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface PaymentProvider {
  authorize(input: { rideId: string; amountCents: number; currency: 'ARS' }): Promise<{ providerReference: string; status: PaymentStatus }>
  refund(input: { providerReference: string; amountCents?: number }): Promise<{ status: PaymentStatus }>
}

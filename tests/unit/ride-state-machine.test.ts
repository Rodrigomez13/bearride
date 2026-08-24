import { describe, expect, it } from 'vitest'
import { canTransitionRide } from '@/lib/rides/state-machine'

describe('ride state machine', () => {
  it('allows only the assigned driver to mark arrival', () => expect(canTransitionRide('DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'DRIVER')).toBe(true))
  it('does not let a passenger start a trip', () => expect(canTransitionRide('DRIVER_ARRIVED', 'TRIP_STARTED', 'PASSENGER')).toBe(false))
  it('does not permit transitions after completion', () => expect(canTransitionRide('COMPLETED', 'CANCELLED', 'SYSTEM')).toBe(false))
})

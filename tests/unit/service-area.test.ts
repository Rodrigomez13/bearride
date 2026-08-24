import { describe, expect, it } from 'vitest'
import { isInFormosa, readCoordinate } from '@/lib/geolocation/service-area'

describe('service area', () => {
  it('accepts a coordinate inside Formosa', () => expect(isInFormosa({ latitude: -26.1775, longitude: -58.1754 })).toBe(true))
  it('rejects a coordinate outside the active area', () => expect(isInFormosa({ latitude: -34.6037, longitude: -58.3816 })).toBe(false))
  it('parses only valid coordinates', () => { expect(readCoordinate('-58.17', -180, 180)).toBe(-58.17); expect(readCoordinate('200', -180, 180)).toBeNull() })
})

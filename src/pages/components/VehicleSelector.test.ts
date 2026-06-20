import { normalizeVehicleNumber } from './VehicleSelector'

describe('normalizeVehicleNumber', () => {
  it('parses a plain numeric string', () => {
    expect(normalizeVehicleNumber('12345')).toBe(12345)
  })

  it('strips formatting punctuation (the vehicle-ref display format)', () => {
    expect(normalizeVehicleNumber('12-345-67')).toBe(1234567)
  })

  it('strips surrounding whitespace and any non-digit characters', () => {
    expect(normalizeVehicleNumber('  7489226  ')).toBe(7489226)
    expect(normalizeVehicleNumber('bus #7489226')).toBe(7489226)
  })

  it('returns undefined when there are no digits', () => {
    expect(normalizeVehicleNumber('')).toBeUndefined()
    expect(normalizeVehicleNumber('abc')).toBeUndefined()
    expect(normalizeVehicleNumber('---')).toBeUndefined()
  })
})

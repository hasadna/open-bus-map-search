import { routeStartEnd, vehicleIDFormat } from './rotueUtils'

describe('routeStartEnd', () => {
  it('splits a standard route name into start, end, and suffix', () => {
    expect(routeStartEnd('תל אביב<->ירושלים-5')).toEqual(['תל אביב', 'ירושלים', '5'])
  })

  it('returns empty strings when input is undefined', () => {
    expect(routeStartEnd(undefined)).toEqual(['', '', ''])
  })

  it('returns empty strings when input does not match the expected pattern', () => {
    expect(routeStartEnd('ירושלים')).toEqual(['', '', ''])
  })
})

describe('vehicleIDFormat', () => {
  it('returns undefined for undefined input', () => {
    expect(vehicleIDFormat(undefined)).toBeUndefined()
  })

  it('formats a 7-digit vehicle id as XX-XXX-XX', () => {
    expect(vehicleIDFormat(1234567)).toBe('12-345-67')
  })

  it('formats an 8-digit vehicle id as XXX-XX-XXX', () => {
    expect(vehicleIDFormat(12345678)).toBe('123-45-678')
  })

  it('returns the value as a string when length is not 7 or 8', () => {
    expect(vehicleIDFormat(12345)).toBe('12345')
  })
})

import {
  formatStartTimeForQuery,
  normalizeScheduledTime,
  normalizeStartTimeToken,
  parseStartTimeToken,
} from './startTimeUtils'

describe('normalizeScheduledTime', () => {
  it('converts dashes to colons', () => {
    expect(normalizeScheduledTime('08-30')).toBe('08:30')
  })

  it('pads single-digit hour', () => {
    expect(normalizeScheduledTime('8:05')).toBe('08:05')
  })

  it('strips seconds from HH:MM:SS format', () => {
    expect(normalizeScheduledTime('08:30:00')).toBe('08:30')
  })

  it('returns undefined for out-of-range hour', () => {
    expect(normalizeScheduledTime('25:00')).toBeUndefined()
  })

  it('returns undefined for undefined input', () => {
    expect(normalizeScheduledTime(undefined)).toBeUndefined()
  })
})

describe('parseStartTimeToken', () => {
  it('parses full token into an object with all three parts', () => {
    expect(parseStartTimeToken('08:30|v123|l64')).toEqual({
      scheduledTime: '08:30',
      vehicleRef: 'v123',
      lineRef: 'l64',
    })
  })

  it('parses time-only token with undefined vehicleRef and lineRef', () => {
    expect(parseStartTimeToken('08:30')).toEqual({
      scheduledTime: '08:30',
      vehicleRef: undefined,
      lineRef: undefined,
    })
  })

  it('returns undefined when the time part is invalid', () => {
    expect(parseStartTimeToken('invalid|v123|l64')).toBeUndefined()
  })
})

describe('normalizeStartTimeToken', () => {
  it('normalizes dashes in the time part of a full token', () => {
    expect(normalizeStartTimeToken('08-30|v123|l64')).toBe('08:30|v123|l64')
  })

  it('returns scheduledTime and vehicleRef when lineRef is absent', () => {
    expect(normalizeStartTimeToken('08:30|v123')).toBe('08:30|v123')
  })

  it('returns only scheduledTime when vehicleRef and lineRef are absent', () => {
    expect(normalizeStartTimeToken('08:30')).toBe('08:30')
  })
})

describe('formatStartTimeForQuery', () => {
  it('converts colons to dashes for URL query param', () => {
    expect(formatStartTimeForQuery('08:30')).toBe('08-30')
  })

  it('returns empty string for undefined input', () => {
    expect(formatStartTimeForQuery(undefined)).toBe('')
  })
})

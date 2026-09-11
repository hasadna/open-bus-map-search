import {
  formatStartTimeForQuery,
  normalizeScheduledTime,
  normalizeStartTimeToken,
  parseStartTimeToken,
} from './startTimeUtils'

/**
 * The start-time token is the only carrier of a chosen departure across the
 * gaps -> single-line interlink and into the stops query. It is a plain Israel
 * wall-clock "HH:mm" — rides belong to the calendar day they depart on, matching
 * how the backend files them.
 */

describe('normalizeScheduledTime', () => {
  it.each([
    ['00:00', '00:00'],
    ['23:59', '23:59'],
    ['5:30', '05:30'], // zero-pads single-digit hour
    ['08-30', '08:30'], // dash form (URL-safe) is accepted
    ['08:30:00', '08:30'], // seconds are stripped
  ])('accepts %s -> %s', (raw, expected) => {
    expect(normalizeScheduledTime(raw)).toBe(expected)
  })

  it.each([
    ['24:00'], // past the end of the day — no extended hours
    ['25:30'],
    ['30:00'],
    ['99:00'],
    ['12:60'], // minute out of range
    ['12:5'], // minute must be two digits
    ['abc'],
    [''],
    [undefined],
  ])('rejects %s', (raw) => {
    expect(normalizeScheduledTime(raw)).toBeUndefined()
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

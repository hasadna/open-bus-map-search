import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'
import {
  formatServiceDayTime,
  formatStartTimeForQuery,
  normalizeScheduledTime,
  normalizeStartTimeToken,
  parseStartTimeToken,
  serviceDayTokenToDisplay,
} from './startTimeUtils'

/**
 * Regression tests for the service-day token logic used by the single-line / gaps
 * interlinking (useSingleLineData, GapsTable).
 *
 * Context (verified against live SIRI+GTFS data): the backend files every ride
 * under its own calendar day — there is no extended >24h service day in the source.
 * The frontend invents one: rides from 00:00 of the selected day through 04:00 the
 * next day are shown together, with past-midnight departures encoded as extended-
 * hour tokens (e.g. "25:30" = 01:30 the next calendar day).
 *
 * The tokens are WALL-CLOCK based on purpose, so they survive Israel's two DST
 * transitions a year. These tests lock that in — they are the only place the DST
 * behavior is exercised, because the HAR e2e tests are frozen to a single normal
 * day (2024-02-12).
 *
 * Israel DST 2024: spring-forward Fri 2024-03-29 (a 23-hour day),
 *                  fall-back   Sun 2024-10-27 (a 25-hour day).
 */

const il = (iso: string) => dayjs.tz(iso, ISRAEL_TIMEZONE)
const serviceDayStart = (day: string) => il(day).startOf('day')

// Mirrors the stops-query reconstruction in useSingleLineData:
//   serviceDayStart.hour(h).minute(m) from the token's scheduledTime.
const reconstruct = (start: dayjs.Dayjs, token: string) => {
  const parsed = parseStartTimeToken(token)
  if (!parsed) throw new Error(`token did not parse: ${token}`)
  const [h, m] = parsed.scheduledTime.split(':').map(Number)
  return start.hour(h).minute(m).second(0).millisecond(0)
}

describe('formatServiceDayTime', () => {
  it.each([
    // selected service day | ride instant (Israel)      | expected token
    ['normal', '2024-02-12', '2024-02-12T06:30', '06:30'],
    ['normal', '2024-02-12', '2024-02-12T23:45', '23:45'],
    ['normal', '2024-02-12', '2024-02-13T00:15', '24:15'], // just past midnight
    ['normal', '2024-02-12', '2024-02-13T01:30', '25:30'],
    ['normal', '2024-02-12', '2024-02-13T03:30', '27:30'],
    ['normal', '2024-02-12', '2024-02-13T04:00', '28:00'], // inclusive window end
    // DST fall-back service day (25h): a diff-of-minutes token would read 26:30 here.
    ['fall', '2024-10-27', '2024-10-28T01:30', '25:30'],
    ['fall', '2024-10-27', '2024-10-28T03:30', '27:30'],
    // DST spring-forward service day (23h): a diff-of-minutes token would read 24:30.
    ['spring', '2024-03-29', '2024-03-30T01:30', '25:30'],
    ['spring', '2024-03-29', '2024-03-30T03:30', '27:30'],
  ])('%s day %s: ride %s -> token %s', (_label, day, ride, expected) => {
    expect(formatServiceDayTime(il(ride), serviceDayStart(day))).toBe(expected)
  })
})

describe('normalizeScheduledTime', () => {
  it.each([
    ['00:00', '00:00'],
    ['23:59', '23:59'],
    ['25:30', '25:30'], // extended hour
    ['28:00', '28:00'], // inclusive window end (04:00 next day)
    ['5:30', '05:30'], // zero-pads single-digit hour
    ['25-30', '25:30'], // dash form (URL-safe) is accepted
    ['08:30:00', '08:30'], // seconds are stripped
  ])('accepts %s -> %s', (raw, expected) => {
    expect(normalizeScheduledTime(raw)).toBe(expected)
  })

  it.each([
    ['29:00'], // past the 28:00 service-window end
    ['30:00'],
    ['99:00'],
    ['24:60'], // minute out of range
    ['12:5'], // minute must be two digits
    ['abc'],
    [''],
    [undefined],
  ])('rejects %s', (raw) => {
    expect(normalizeScheduledTime(raw)).toBeUndefined()
  })
})

describe('serviceDayTokenToDisplay', () => {
  it.each([
    // own-day times pass through unchanged, not flagged
    ['06:30', '06:30', false],
    ['23:45', '23:45', false],
    ['00:00', '00:00', false],
    // extended hours fold back to the wall clock and are flagged next-day
    ['24:00', '00:00', true],
    ['24:15', '00:15', true],
    ['25:30', '01:30', true],
    ['27:30', '03:30', true],
    ['28:00', '04:00', true],
  ])('%s -> %s (nextDay=%s)', (token, time, nextDay) => {
    expect(serviceDayTokenToDisplay(token)).toEqual({ time, nextDay })
  })

  it('zero-pads the folded hour', () => {
    expect(serviceDayTokenToDisplay('24:05')).toEqual({ time: '00:05', nextDay: true })
  })

  it('returns the input unchanged for an unparseable token', () => {
    expect(serviceDayTokenToDisplay('abc')).toEqual({ time: 'abc', nextDay: false })
  })
})

describe('service-day token round-trip (format -> parse -> reconstruct)', () => {
  // The token is the only carrier of the chosen departure across the gaps -> single-
  // line interlink and into the stops query. It must reconstruct the exact instant —
  // the old diff-of-minutes token failed this on the fall-back night (03:30 ride ->
  // token "28:30" -> reconstructed 04:30, fetching stops for the wrong departure).
  it.each([
    ['normal', '2024-02-12', '2024-02-12T06:30'],
    ['normal', '2024-02-12', '2024-02-13T00:15'],
    ['normal', '2024-02-12', '2024-02-13T01:30'],
    ['normal', '2024-02-12', '2024-02-13T03:30'],
    ['fall', '2024-10-27', '2024-10-28T01:30'],
    ['fall', '2024-10-27', '2024-10-28T03:30'], // the exact regression case
    ['spring', '2024-03-29', '2024-03-30T01:30'],
    ['spring', '2024-03-29', '2024-03-30T03:30'],
  ])('%s day %s: ride %s round-trips to the same instant', (_label, day, ride) => {
    const start = serviceDayStart(day)
    const instant = il(ride)
    const token = formatServiceDayTime(instant, start)
    expect(reconstruct(start, token).isSame(instant)).toBe(true)
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

import dayjs, { ISRAEL_TIMEZONE, parseIsraelLocalDatetime, toGtfsServiceDate } from './dayjs'

describe('toGtfsServiceDate', () => {
  // The GTFS client serializes date_from/date_to as Date.toISOString().slice(0, 10),
  // so the round-trip we actually care about is that UTC date string.
  const serializedDate = (d: Date) => d.toISOString().slice(0, 10)

  it('keeps an Israel-midnight Date on its own calendar day in summer (DST, +03:00)', () => {
    // dayjs.tz(date, IL) is 21:00Z the previous day in summer — the off-by-one source.
    const israelMidnight = dayjs.tz('2026-06-20', ISRAEL_TIMEZONE).toDate()
    expect(serializedDate(israelMidnight)).toBe('2026-06-19') // the bug, before the fix
    expect(serializedDate(toGtfsServiceDate(israelMidnight))).toBe('2026-06-20')
  })

  it('keeps an Israel-midnight Date on its own calendar day in winter (+02:00)', () => {
    const israelMidnight = dayjs.tz('2026-01-15', ISRAEL_TIMEZONE).toDate()
    expect(serializedDate(toGtfsServiceDate(israelMidnight))).toBe('2026-01-15')
  })

  it('maps a real instant to its Israeli service day, not the UTC day', () => {
    // 2026-06-18T21:10Z is 00:10 the next day in Israel summer time.
    expect(serializedDate(toGtfsServiceDate(new Date('2026-06-18T21:10:00Z')))).toBe('2026-06-19')
  })
})

describe('parseIsraelLocalDatetime', () => {
  it('parses a shared-URL datetime as Israel-local time', () => {
    const parsed = parseIsraelLocalDatetime('2023-03-14T17:00')
    expect(parsed).not.toBeNull()
    // 2023-03-14 is before the Israeli DST switch, so local 17:00 is 15:00 UTC
    expect(parsed?.toISOString()).toBe('2023-03-14T15:00:00.000Z')
  })

  it('returns null instead of throwing on unparsable input', () => {
    // dayjs.tz throws RangeError on input like this; an uncaught throw in the
    // /map useState initializer crashed the whole route (PR #1645 regression)
    expect(parseIsraelLocalDatetime('garbage')).toBeNull()
  })

  it('returns null for empty and malformed datetime strings', () => {
    expect(parseIsraelLocalDatetime('')).toBeNull()
    expect(parseIsraelLocalDatetime('not-a-date 17:00')).toBeNull()
    expect(parseIsraelLocalDatetime('1699900000000junk')).toBeNull()
  })
})

import { parseIsraelLocalDatetime, utcNoonForDateStr } from './dayjs'

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

describe('utcNoonForDateStr', () => {
  it('serializes back to the same calendar date via toISOString (the #1680 fix)', () => {
    // GTFS list endpoints serialize date_from/date_to with .toISOString().substring(0,10).
    // A Date at Israel midnight is 21:00Z of the *previous* day and would serialize to the
    // wrong date; anchoring to 12:00 UTC keeps the serialized date correct.
    const dateStr = '2026-06-21'
    expect(utcNoonForDateStr(dateStr).toISOString().substring(0, 10)).toBe(dateStr)
  })

  it('anchors the returned Date to exactly 12:00 UTC', () => {
    expect(utcNoonForDateStr('2026-06-21').toISOString()).toBe('2026-06-21T12:00:00.000Z')
  })

  it('preserves the date across a range of months, including DST boundaries', () => {
    const dates = ['2026-01-01', '2026-03-27', '2026-03-28', '2026-10-25', '2026-12-31']
    for (const d of dates) {
      expect(utcNoonForDateStr(d).toISOString().substring(0, 10)).toBe(d)
    }
  })
})

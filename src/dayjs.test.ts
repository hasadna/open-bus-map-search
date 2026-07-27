import { israelDayBounds, parseIsraelLocalDatetime, utcNoonForDateStr } from './dayjs'

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

describe('israelDayBounds', () => {
  // Asserted as absolute instants, not formatted strings: a bound resolved against
  // the wrong side of a DST transition still *formats* as "00:00" (it renders through
  // the same wrong offset), so only the instant catches it. Israel switches at 02:00,
  // hence the 23h/25h windows. CI runs in UTC while dev machines run in Israel time,
  // so this is exactly the case that has to hold in both.
  it.each([
    ['a normal day', '2024-02-12', '2024-02-11T22:00:00.000Z', '2024-02-12T22:00:00.000Z', 24],
    ['spring forward', '2024-03-29', '2024-03-28T22:00:00.000Z', '2024-03-29T21:00:00.000Z', 23],
    ['fall back', '2024-10-27', '2024-10-26T21:00:00.000Z', '2024-10-27T22:00:00.000Z', 25],
    // the day *after* each transition, where the new offset is in force all day
    [
      'post spring forward',
      '2024-03-30',
      '2024-03-29T21:00:00.000Z',
      '2024-03-30T21:00:00.000Z',
      24,
    ],
    ['post fall back', '2024-10-28', '2024-10-27T22:00:00.000Z', '2024-10-28T22:00:00.000Z', 24],
  ])('spans %s as Israel midnight to Israel midnight', (_label, date, startISO, endISO, hours) => {
    const { start, end } = israelDayBounds(date)
    expect(start.toISOString()).toBe(startISO)
    expect(end.toISOString()).toBe(endISO)
    expect(end.diff(start, 'hour')).toBe(hours)
  })

  it('reconstructs a departure instant from an HH:mm token', () => {
    // Mirrors the stops-query reconstruction in useSingleLineData.
    const { start } = israelDayBounds('2024-10-27')
    expect(start.hour(3).minute(30).format('YYYY-MM-DD HH:mm')).toBe('2024-10-27 03:30')
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

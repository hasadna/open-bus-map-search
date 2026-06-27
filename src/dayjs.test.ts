import dayjs, { parseIsraelLocalDatetime, toApiDate } from './dayjs'

describe('toApiDate', () => {
  // The generated API client serializes `format: date` params as
  // value.toISOString().substring(0, 10), i.e. it reads the calendar day in UTC.
  const clientSerialize = (d: Date) => d.toISOString().substring(0, 10)

  it('keeps the Israeli calendar day for an Israel-midnight Dayjs (off-by-one regression)', () => {
    // Israel midnight is 21:00/22:00 UTC of the PREVIOUS day, so the naive
    // .toDate() truncated to the wrong date. toApiDate must not.
    const israelMidnight = dayjs.tz('2024-01-15', 'Asia/Jerusalem').startOf('day')
    expect(clientSerialize(toApiDate(israelMidnight))).toBe('2024-01-15')
  })

  it('anchors at noon UTC so the date is timezone-stable', () => {
    expect(toApiDate(dayjs.tz('2024-06-15', 'Asia/Jerusalem')).toISOString()).toBe(
      '2024-06-15T12:00:00.000Z',
    )
  })

  it('maps a real instant to its Israeli calendar day', () => {
    // 2024-06-15T22:30:00Z is 2024-06-16 01:30 Israel time (DST) — next calendar day.
    expect(clientSerialize(toApiDate(dayjs('2024-06-15T22:30:00Z')))).toBe('2024-06-16')
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

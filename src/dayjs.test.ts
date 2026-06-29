import dayjs, {
  apiDateFromString,
  clampToToday,
  formatIsraelDate,
  normalizeIsraelDate,
  parseIsraelDate,
  parseIsraelLocalDatetime,
  shiftIsraelDate,
  toApiDate,
  todayIsraelDate,
} from './dayjs'

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

describe('parseIsraelDate', () => {
  const clientSerialize = (d: Date) => d.toISOString().substring(0, 10)

  it('round-trips with formatIsraelDate', () => {
    expect(formatIsraelDate(parseIsraelDate('2026-06-28'))).toBe('2026-06-28')
  })

  it('anchors at Israel noon so the civil day survives UTC truncation (Jest runs in UTC)', () => {
    const noon = parseIsraelDate('2026-06-28')
    expect(noon.tz('Asia/Jerusalem').format('HH:mm')).toBe('12:00')
    // toApiDate reads the calendar day in UTC; the noon anchor must keep it on the 28th.
    expect(clientSerialize(toApiDate(noon))).toBe('2026-06-28')
  })

  it('falls back to today on malformed or overflow input', () => {
    expect(formatIsraelDate(parseIsraelDate('2026-02-30'))).toBe(todayIsraelDate())
    expect(formatIsraelDate(parseIsraelDate('2026-6-1'))).toBe(todayIsraelDate())
    expect(formatIsraelDate(parseIsraelDate('garbage'))).toBe(todayIsraelDate())
    expect(formatIsraelDate(parseIsraelDate(''))).toBe(todayIsraelDate())
  })
})

describe('formatIsraelDate', () => {
  it('reads the Israel calendar day of a real instant', () => {
    // 22:30 UTC is 01:30 the next day in Israel (DST) — the Israel civil day is the 16th.
    expect(formatIsraelDate(dayjs('2024-06-15T22:30:00Z'))).toBe('2024-06-16')
  })
})

describe('normalizeIsraelDate', () => {
  it('passes a canonical civil-day string through unchanged', () => {
    expect(normalizeIsraelDate('2026-05-01')).toBe('2026-05-01')
  })

  it('reads the Israel calendar day off a legacy full ISO datetime (older shared links)', () => {
    // gaps_patterns used to serialize its range bounds via .toISOString(); 00:00Z is
    // 02:00/03:00 Israel time — still the 1st.
    expect(normalizeIsraelDate('2026-05-01T00:00:00.000Z')).toBe('2026-05-01')
    // 22:30 UTC is past midnight in Israel — the civil day rolls to the next day.
    expect(normalizeIsraelDate('2024-06-15T22:30:00Z')).toBe('2024-06-16')
  })

  it('returns undefined for missing or unparsable input (caller supplies its own default)', () => {
    expect(normalizeIsraelDate(undefined)).toBeUndefined()
    expect(normalizeIsraelDate('')).toBeUndefined()
    expect(normalizeIsraelDate('garbage')).toBeUndefined()
  })
})

describe('shiftIsraelDate', () => {
  it('crosses month, year and leap-day boundaries', () => {
    expect(shiftIsraelDate('2026-06-30', 1)).toBe('2026-07-01')
    expect(shiftIsraelDate('2026-12-31', 1)).toBe('2027-01-01')
    expect(shiftIsraelDate('2024-02-28', 1)).toBe('2024-02-29') // leap year
    expect(shiftIsraelDate('2026-02-28', 1)).toBe('2026-03-01') // non-leap
  })

  it('shifts backward and by multiple days', () => {
    expect(shiftIsraelDate('2026-03-01', -1)).toBe('2026-02-28')
    expect(shiftIsraelDate('2026-06-28', -7)).toBe('2026-06-21')
    expect(shiftIsraelDate('2026-06-28', 0)).toBe('2026-06-28')
  })

  it('shifts by week/month/year units (operator time-range selector)', () => {
    expect(shiftIsraelDate('2026-06-28', -1, 'week')).toBe('2026-06-21')
    expect(shiftIsraelDate('2026-06-28', -1, 'month')).toBe('2026-05-28')
    expect(shiftIsraelDate('2026-06-28', -1, 'year')).toBe('2025-06-28')
    // month arithmetic clamps to the shorter month
    expect(shiftIsraelDate('2026-03-31', -1, 'month')).toBe('2026-02-28')
    // explicit 'day' matches the default
    expect(shiftIsraelDate('2026-06-28', -7, 'day')).toBe('2026-06-21')
  })
})

describe('apiDateFromString', () => {
  const clientSerialize = (d: Date) => d.toISOString().substring(0, 10)

  it('serializes a civil-day string to the API Date param, UTC-stable (Jest runs in UTC)', () => {
    expect(clientSerialize(apiDateFromString('2026-06-28'))).toBe('2026-06-28')
  })
})

describe('clampToToday', () => {
  it('caps a future day at today and leaves past/today untouched', () => {
    expect(clampToToday('2999-12-31')).toBe(todayIsraelDate())
    expect(clampToToday('2000-01-01')).toBe('2000-01-01')
    expect(clampToToday(todayIsraelDate())).toBe(todayIsraelDate())
  })
})

describe('todayIsraelDate', () => {
  afterEach(() => jest.useRealTimers())

  it('projects the current instant onto the Israel calendar day', () => {
    // 20:00 UTC is 23:00 the same day in Israel; 22:30 UTC is 01:30 the next day.
    jest.useFakeTimers().setSystemTime(new Date('2024-06-15T20:00:00Z'))
    expect(todayIsraelDate()).toBe('2024-06-15')

    jest.setSystemTime(new Date('2024-06-15T22:30:00Z'))
    expect(todayIsraelDate()).toBe('2024-06-16')
  })
})

import dayjs, {
  apiDateFromString,
  atTimeOfDay,
  clampToToday,
  formatInstant,
  formatIsraelDate,
  formatTimeOfDay,
  getServiceDayDateBounds,
  getServiceDayTimeBounds,
  instantToApi,
  normalizeIsraelDate,
  nowInstant,
  nowIsraelInstant,
  parseInstant,
  parseIsraelDate,
  parseIsraelLocalDatetime,
  serializeInstant,
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

describe('getServiceDayTimeBounds', () => {
  it('spans 00:00 of the date through 04:00 the next morning', () => {
    const { start, end } = getServiceDayTimeBounds('2024-02-12')
    expect(start.format('YYYY-MM-DD HH:mm')).toBe('2024-02-12 00:00')
    expect(end.format('YYYY-MM-DD HH:mm')).toBe('2024-02-13 04:00')
  })
})

describe('getServiceDayDateBounds', () => {
  it('spans the date itself and the next calendar day, derived from the window', () => {
    expect(getServiceDayDateBounds('2024-02-12')).toEqual({
      today: '2024-02-12',
      tomorrow: '2024-02-13',
    })
  })

  it('rolls the month/year over at the boundary', () => {
    expect(getServiceDayDateBounds('2024-12-31')).toEqual({
      today: '2024-12-31',
      tomorrow: '2025-01-01',
    })
  })
})

describe('parseInstant', () => {
  it('returns undefined for missing or invalid input', () => {
    expect(parseInstant(undefined)).toBeUndefined()
    expect(parseInstant(null)).toBeUndefined()
    expect(parseInstant('')).toBeUndefined()
    expect(parseInstant('not-a-date')).toBeUndefined()
  })

  it('reads a UTC API instant in Israel time (summer, +03:00) — replaces parseTime', () => {
    // The stride API serializes every datetime as real UTC; 04:24Z is 07:24 in Israel (DST).
    expect(parseInstant('2026-06-09T04:24:00Z')?.format('HH:mm')).toBe('07:24')
  })

  it('reads a UTC API instant in Israel time (winter, +02:00)', () => {
    expect(parseInstant('2026-01-09T04:24:00Z')?.format('HH:mm')).toBe('06:24')
  })

  it('treats a bare offset-less string as UTC (the API convention)', () => {
    // Robust even if an endpoint ever drops the +00:00; independent of the runtime zone.
    expect(parseInstant('2026-06-09T04:24:00')?.format('HH:mm')).toBe('07:24')
  })

  it('accepts a Date and an epoch-ms number, both as true instants', () => {
    expect(parseInstant(new Date('2026-06-09T04:24:00Z'))?.format('HH:mm')).toBe('07:24')
    expect(parseInstant(Date.UTC(2026, 5, 9, 4, 24))?.format('HH:mm')).toBe('07:24')
  })
})

describe('serializeInstant', () => {
  it('emits an ISO-8601 string carrying the Israel offset (+03:00 summer, +02:00 winter)', () => {
    expect(serializeInstant('2026-06-09T04:24:00Z')).toBe('2026-06-09T07:24:00+03:00')
    expect(serializeInstant('2026-01-09T04:24:00Z')).toBe('2026-01-09T06:24:00+02:00')
  })

  it('round-trips through parseInstant to the same instant', () => {
    const iso = serializeInstant('2026-06-09T04:24:00Z')
    expect(parseInstant(iso)?.valueOf()).toBe(dayjs('2026-06-09T04:24:00Z').valueOf())
  })
})

describe('formatInstant', () => {
  it('formats in Israel time regardless of the runtime zone (Jest runs in UTC)', () => {
    // A bare dayjs(x).format() would render 04:24 here; the helper must show Israel 07:24.
    expect(formatInstant('2026-06-09T04:24:00Z', 'HH:mm')).toBe('07:24')
    expect(formatInstant(new Date('2026-06-09T22:30:00Z'), 'DD/MM/YYYY HH:mm')).toBe(
      '10/06/2026 01:30',
    )
  })
})

describe('instantToApi', () => {
  it('round-trips a materialized instant to a Date losslessly', () => {
    const instant = parseInstant('2026-06-09T04:24:00Z')!
    expect(instantToApi(instant).toISOString()).toBe('2026-06-09T04:24:00.000Z')
  })
})

describe('nowIsraelInstant / nowInstant', () => {
  afterEach(() => jest.useRealTimers())

  it('reads the clock straight to the canonical Israel-offset string (like todayIsraelDate)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-09T04:24:00Z'))
    expect(nowIsraelInstant()).toBe('2026-06-09T07:24:00+03:00')
  })

  it('materializes the same instant as a Dayjs in Israel time', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-09T04:24:00Z'))
    expect(nowInstant().format('HH:mm')).toBe('07:24')
  })
})

describe('atTimeOfDay', () => {
  it('applies an Israel wall-clock "HH:mm" to a civil day', () => {
    expect(atTimeOfDay('2024-02-12', '15:30').format('YYYY-MM-DD HH:mm')).toBe('2024-02-12 15:30')
  })

  it('falls back to 00:00 on a malformed time', () => {
    expect(atTimeOfDay('2024-02-12', 'garbage').format('HH:mm')).toBe('00:00')
  })
})

describe('formatTimeOfDay', () => {
  it('reads the Israel "HH:mm" off an instant', () => {
    expect(formatTimeOfDay('2026-06-09T04:24:00Z')).toBe('07:24')
  })
})

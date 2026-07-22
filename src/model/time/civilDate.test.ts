import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'
import {
  addDays,
  civilDate,
  type CivilDate,
  civilDateToApiDate,
  civilDateToDayjs,
  isCivilDate,
  shiftCivilDate,
  toCivilDate,
  todayCivilDate,
} from './civilDate'

// Minted through the real constructor so the tests exercise branded values, not casts.
const asCivilDate = (value: string): CivilDate => {
  const parsed = civilDate(value)
  if (parsed === null) throw new Error(`test fixture is not a CivilDate: ${value}`)
  return parsed
}

describe('civilDate', () => {
  it('accepts a well-formed calendar day and returns it verbatim', () => {
    expect(civilDate('2026-06-30')).toBe('2026-06-30')
    expect(civilDate('2000-01-01')).toBe('2000-01-01')
    expect(civilDate('1999-12-31')).toBe('1999-12-31')
  })

  it('accepts a real leap day but rejects a non-leap Feb 29', () => {
    expect(civilDate('2024-02-29')).toBe('2024-02-29')
    expect(civilDate('2025-02-29')).toBeNull()
    expect(civilDate('1900-02-29')).toBeNull() // 1900 is not a leap year
  })

  it('rejects overflow dates a naive parse would silently roll forward', () => {
    expect(civilDate('2026-02-30')).toBeNull()
    expect(civilDate('2026-04-31')).toBeNull()
    expect(civilDate('2026-13-01')).toBeNull()
    expect(civilDate('2026-00-10')).toBeNull()
    expect(civilDate('2026-06-00')).toBeNull()
    expect(civilDate('2026-06-32')).toBeNull()
  })

  it('rejects anything that is not exactly a zero-padded YYYY-MM-DD', () => {
    expect(civilDate('2026-6-30')).toBeNull() // unpadded month
    expect(civilDate('2026-06-3')).toBeNull() // unpadded day
    expect(civilDate('2026/06/30')).toBeNull() // wrong separator
    expect(civilDate('2026-06-30T00:00')).toBeNull() // carries a time
    expect(civilDate('2026-06-30 ')).toBeNull() // trailing space
    expect(civilDate('06-30-2026')).toBeNull() // wrong field order
    expect(civilDate('')).toBeNull()
    expect(civilDate('not-a-date')).toBeNull()
  })
})

describe('isCivilDate', () => {
  it('narrows a matching string and is usable as a type guard', () => {
    const value: unknown = '2026-06-30'
    expect(isCivilDate(value)).toBe(true)
    if (isCivilDate(value)) {
      // compiles only because the guard narrowed `unknown` to CivilDate
      const day: CivilDate = value
      expect(day).toBe('2026-06-30')
    }
  })

  it('rejects malformed, overflow and non-string values', () => {
    expect(isCivilDate('2026-6-30')).toBe(false)
    expect(isCivilDate('2026-02-30')).toBe(false)
    expect(isCivilDate('2026-06-30T00:00')).toBe(false)
    expect(isCivilDate(20260630)).toBe(false)
    expect(isCivilDate(null)).toBe(false)
    expect(isCivilDate(undefined)).toBe(false)
    expect(isCivilDate(new Date())).toBe(false)
  })
})

describe('addDays', () => {
  it('shifts forward and backward by whole days', () => {
    expect(addDays(asCivilDate('2026-06-30'), 1)).toBe('2026-07-01')
    expect(addDays(asCivilDate('2026-06-30'), -1)).toBe('2026-06-29')
    expect(addDays(asCivilDate('2026-06-30'), 0)).toBe('2026-06-30')
    expect(addDays(asCivilDate('2026-06-30'), 7)).toBe('2026-07-07')
  })

  it('crosses month, year and leap-day boundaries correctly', () => {
    expect(addDays(asCivilDate('2026-12-31'), 1)).toBe('2027-01-01')
    expect(addDays(asCivilDate('2027-01-01'), -1)).toBe('2026-12-31')
    expect(addDays(asCivilDate('2024-02-28'), 1)).toBe('2024-02-29') // leap year
    expect(addDays(asCivilDate('2025-02-28'), 1)).toBe('2025-03-01') // non-leap year
  })

  it('returns a canonical, branded CivilDate', () => {
    expect(isCivilDate(addDays(asCivilDate('2026-06-30'), 100))).toBe(true)
  })
})

describe('shiftCivilDate', () => {
  it('shifts by weeks and months in both directions', () => {
    expect(shiftCivilDate(asCivilDate('2026-06-30'), -1, 'week')).toBe('2026-06-23')
    expect(shiftCivilDate(asCivilDate('2026-06-30'), 1, 'week')).toBe('2026-07-07')
    expect(shiftCivilDate(asCivilDate('2026-06-30'), -1, 'month')).toBe('2026-05-30')
    expect(shiftCivilDate(asCivilDate('2026-06-30'), 1, 'month')).toBe('2026-07-30')
  })

  it('clamps to the target month end and respects leap years', () => {
    // one month before 2024-03-31 is Feb, which has no 31st → clamps to the 29th (leap)
    expect(shiftCivilDate(asCivilDate('2024-03-31'), -1, 'month')).toBe('2024-02-29')
    expect(shiftCivilDate(asCivilDate('2025-03-31'), -1, 'month')).toBe('2025-02-28')
  })

  it('returns a canonical, branded CivilDate', () => {
    expect(isCivilDate(shiftCivilDate(asCivilDate('2026-06-30'), -1, 'month'))).toBe(true)
  })
})

describe('civilDateToApiDate', () => {
  it('anchors the calendar day at 12:00 UTC so it never drifts to the previous day', () => {
    const wire = civilDateToApiDate(asCivilDate('2026-06-30'))
    expect(wire.toISOString()).toBe('2026-06-30T12:00:00.000Z')
    // the shape the GTFS list endpoints actually serialize
    expect(wire.toISOString().substring(0, 10)).toBe('2026-06-30')
  })
})

describe('civilDateToDayjs', () => {
  it('materializes the same 12:00 UTC anchor as a Dayjs', () => {
    const day = civilDateToDayjs(asCivilDate('2026-06-30'))
    expect(day.toISOString()).toBe('2026-06-30T12:00:00.000Z')
    expect(day.valueOf()).toBe(civilDateToApiDate(asCivilDate('2026-06-30')).getTime())
  })
})

describe('toCivilDate', () => {
  it('reads the Israel calendar day of a zoned moment', () => {
    expect(toCivilDate('2026-06-30T23:30:00+03:00')).toBe('2026-06-30')
  })

  it('maps a just-after-midnight UTC instant to the Israeli next day (summer, +03:00)', () => {
    // 21:30Z on 2026-06-30 is 00:30 on 2026-07-01 in Israel (IDT)
    expect(toCivilDate('2026-06-30T21:30:00Z')).toBe('2026-07-01')
  })

  it('maps a just-after-midnight UTC instant to the Israeli next day (winter, +02:00)', () => {
    // 22:30Z on 2026-01-15 is 00:30 on 2026-01-16 in Israel (IST)
    expect(toCivilDate('2026-01-15T22:30:00Z')).toBe('2026-01-16')
  })

  it('returns null on unparsable input', () => {
    expect(toCivilDate('garbage')).toBeNull()
  })

  it('reads the Israel calendar day of a Dayjs regardless of its time-of-day', () => {
    // A Dayjs carrying a mid-afternoon wall time still maps to that same calendar day.
    expect(toCivilDate(dayjs.tz('2026-06-30 14:23', ISRAEL_TIMEZONE))).toBe('2026-06-30')
  })

  it('maps a just-before-midnight Israel Dayjs to that same Israeli day', () => {
    expect(toCivilDate(dayjs.tz('2026-06-30 23:59', ISRAEL_TIMEZONE))).toBe('2026-06-30')
  })
})

describe('todayCivilDate', () => {
  it('returns a canonical CivilDate for the current Israel day', () => {
    expect(isCivilDate(todayCivilDate())).toBe(true)
  })
})

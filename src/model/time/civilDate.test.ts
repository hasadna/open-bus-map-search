import { civilDate, type CivilDate, isCivilDate } from './civilDate'

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

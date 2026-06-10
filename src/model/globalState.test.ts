import { GLOBAL_SEARCH_DEFAULTS, isValidSearchDate } from './globalState'

describe('isValidSearchDate', () => {
  it('accepts a YYYY-MM-DD date string', () => {
    expect(isValidSearchDate('2026-05-01')).toBe(true)
  })

  it('accepts the default date', () => {
    expect(isValidSearchDate(GLOBAL_SEARCH_DEFAULTS.date)).toBe(true)
  })

  it('rejects strings that are not YYYY-MM-DD', () => {
    expect(isValidSearchDate('01/05/2026')).toBe(false)
    expect(isValidSearchDate('2026-5-1')).toBe(false)
    expect(isValidSearchDate('2026-05-01T00:00:00Z')).toBe(false)
    expect(isValidSearchDate('1699900000000')).toBe(false)
    expect(isValidSearchDate('not-a-date')).toBe(false)
  })

  it('rejects empty and non-string values', () => {
    expect(isValidSearchDate('')).toBe(false)
    expect(isValidSearchDate(undefined)).toBe(false)
    expect(isValidSearchDate(null)).toBe(false)
    expect(isValidSearchDate(1699900000000)).toBe(false)
  })
})

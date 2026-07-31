import 'src/dayjs'
import { parseTime } from './gapsService'

describe('parseTime', () => {
  it('returns undefined when time is undefined', () => {
    expect(parseTime(undefined)).toBeUndefined()
  })

  it('returns undefined for an invalid date string', () => {
    expect(parseTime('not-a-date')).toBeUndefined()
  })

  it('converts UTC time to Israel timezone (summer, UTC+3)', () => {
    const result = parseTime('2026-06-09T04:24:00Z')
    expect(result?.format('HH:mm')).toBe('07:24')
  })
})

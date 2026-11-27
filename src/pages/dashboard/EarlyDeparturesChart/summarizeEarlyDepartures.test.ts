import type { OriginDeparturesDay } from 'src/api/kavBochanService'
import { civilDate } from 'src/model/time/civilDate'
import { summarizeEarlyDepartures } from './summarizeEarlyDepartures'

const day = (date: string, early: number, measured: number): OriginDeparturesDay => ({
  date: civilDate(date)!,
  early,
  measured,
})

const DAYS = [
  day('2026-11-03', 6, 1000),
  day('2026-11-01', 2, 1000),
  day('2026-11-02', 4, 500),
  day('2026-11-04', 9, 900),
]

describe('summarizeEarlyDepartures', () => {
  it('sums the days of the range, both ends included, in calendar order', () => {
    const summary = summarizeEarlyDepartures(
      DAYS,
      civilDate('2026-11-01')!,
      civilDate('2026-11-03')!,
    )

    expect(summary.days.map(({ date, earlyPercent }) => [date, earlyPercent])).toEqual([
      ['2026-11-01', 0.2],
      ['2026-11-02', 0.8],
      ['2026-11-03', 0.6],
    ])
    expect(summary.early).toBe(12)
    expect(summary.measured).toBe(2500)
  })

  it('reports the whole published span, whatever range was asked for', () => {
    const summary = summarizeEarlyDepartures(
      DAYS,
      civilDate('2026-10-01')!,
      civilDate('2026-10-07')!,
    )

    expect(summary.days).toEqual([])
    expect(summary.available).toEqual({ first: '2026-11-01', last: '2026-11-04' })
  })

  it('has no published span when the source has no days', () => {
    const summary = summarizeEarlyDepartures([], civilDate('2026-11-01')!, civilDate('2026-11-07')!)

    expect(summary.available).toBeUndefined()
    expect(summary.measured).toBe(0)
  })
})

import type { OriginDeparturesDay } from 'src/api/kavBochanService'
import type { CivilDate } from 'src/model/time/civilDate'

export interface EarlyDeparturesSummary {
  days: (OriginDeparturesDay & { earlyPercent: number })[]
  early: number
  measured: number
  /** The days the source publishes at all, so a range it only partly covers can say so. */
  available: { first: CivilDate; last: CivilDate } | undefined
}

export function summarizeEarlyDepartures(
  allDays: OriginDeparturesDay[],
  startDate: CivilDate,
  endDate: CivilDate,
): EarlyDeparturesSummary {
  const days = allDays
    .filter(({ date }) => date >= startDate && date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({ ...day, earlyPercent: (day.early / day.measured) * 100 }))

  const dates = allDays.map(({ date }) => date).sort()

  return {
    days,
    early: days.reduce((sum, day) => sum + day.early, 0),
    measured: days.reduce((sum, day) => sum + day.measured, 0),
    available: dates.length ? { first: dates[0], last: dates[dates.length - 1] } : undefined,
  }
}

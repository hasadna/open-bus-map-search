import { queryOptions } from '@tanstack/react-query'
import { type CivilDate, civilDate } from 'src/model/time/civilDate'

export const KAV_BOCHAN_BUS_PAGE_URL = 'https://kavbochan.app/bus/'
const BUS_INDEX_URL = `${KAV_BOCHAN_BUS_PAGE_URL}data/index.json`

/** The departures of one day from the first stop of a route, among the rides whose departure
 *  was measured. A ride is early when it left more than 2 minutes before the timetable. */
export interface OriginDeparturesDay {
  date: CivilDate
  early: number
  measured: number
}

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

/**
 * kavbochan.app publishes this index without a formal schema; its maintainer keeps the fields
 * read here stable on request (hasadna/open-bus-map-search#1919): `days[].d`, the calendar day
 * a ride departs on, and `days[].o`, the origin departures counted per category, early first.
 */
export function parseOriginDepartures(index: unknown): OriginDeparturesDay[] {
  const days = (index as { days?: unknown } | null)?.days
  if (!Array.isArray(days)) throw new Error('kavbochan.app bus index has no days list')

  return days.flatMap((day: unknown): OriginDeparturesDay[] => {
    const { d, o } = (day ?? {}) as { d?: unknown; o?: unknown }
    const date = typeof d === 'string' ? civilDate(d) : null
    // The generator lists a day it failed to summarize as a bare `{d}`.
    if (!date || !Array.isArray(o) || !o.every(isCount)) return []
    const measured = o.reduce((sum, count) => sum + count, 0)
    return measured > 0 ? [{ date, early: o[0], measured }] : []
  })
}

export const originDeparturesQueryOptions = () =>
  queryOptions({
    queryKey: ['kavBochan', 'originDepartures'],
    queryFn: async ({ signal }) => {
      const response = await fetch(BUS_INDEX_URL, { signal })
      if (!response.ok) throw new Error(`kavbochan.app responded ${response.status}`)
      return parseOriginDepartures(await response.json())
    },
    // Unlike Stride's history, this index gains a day every night, so the app-wide
    // "fetch once, keep forever" defaults would freeze it at the first visit.
    staleTime: 60 * 60 * 1000,
    refetchOnMount: true,
  })

import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { queryOptions } from '@tanstack/react-query'
import dayjs, { utcNoonForDateStr } from 'src/dayjs'
import { GTFS_API } from './apiConfig'

// The endpoint answers one row per operator per date and caps the result at 100 rows when
// no limit is sent, so a range has to ask for room for every (operator x date) combination
// or its later days silently fall off. The picker allows ranges back to 2023.
const LIMIT = 100000

const FALLBACK_DAYS = 7

/**
 * One row per operator, carrying the agency name from the latest date it appears on.
 *
 * open-bus-stride-api#58 does this in the API (`merge=true`); until it is merged, a range
 * query answers with one row per operator *per date*, so the frontend has to merge itself.
 */
export function mergeAgencies(agencies: GtfsAgencyPydanticModel[]): GtfsAgencyPydanticModel[] {
  const latestPerOperator = new Map<number, GtfsAgencyPydanticModel>()
  for (const agency of agencies) {
    const latest = latestPerOperator.get(agency.operatorRef)
    if (!latest || latest.date < agency.date) {
      latestPerOperator.set(agency.operatorRef, agency)
    }
  }
  return Array.from(latestPerOperator.values())
}

/** Agencies that ran between two "YYYY-MM-DD" dates (inclusive), one row per operator. */
export async function fetchAgencyList(
  dateFrom: string,
  dateTo: string,
): Promise<GtfsAgencyPydanticModel[]> {
  const agencies = await GTFS_API.gtfsAgenciesListGet({
    dateFrom: utcNoonForDateStr(dateFrom),
    dateTo: utcNoonForDateStr(dateTo),
    limit: LIMIT,
  })
  return mergeAgencies(agencies.filter(Boolean))
}

export function agencyListQueryOptions(dateFrom: string, dateTo: string) {
  return queryOptions({
    queryKey: ['agencyList', dateFrom, dateTo],
    queryFn: () => fetchAgencyList(dateFrom, dateTo),
  })
}

/**
 * Agencies of a single "YYYY-MM-DD" day, widening to the preceding week when that day holds
 * no data yet - GTFS for the current day is published only later in the day, and an empty
 * operator list is worse than one a few days old.
 */
export function agencyListForDateQueryOptions(date: string) {
  return queryOptions({
    queryKey: ['agencyList', 'day', date],
    queryFn: async () => {
      const agencies = await fetchAgencyList(date, date)
      if (agencies.length) return agencies
      return fetchAgencyList(dayjs(date).subtract(FALLBACK_DAYS, 'day').format('YYYY-MM-DD'), date)
    },
  })
}

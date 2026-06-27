import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import dayjs, { toApiDate } from 'src/dayjs'
import { GTFS_API } from './apiConfig'

let agencyListPromise: Promise<GtfsAgencyPydanticModel[]> | null = null

async function fetchAgencyList() {
  // Build the candidate `date_from` values through toApiDate like every other
  // `format: date` param, and resolve them lazily (not at module load) so the
  // timezone-anchored calendar day is computed at call time.
  const tryDates = [
    toApiDate(dayjs().subtract(1, 'day')),
    toApiDate(dayjs().subtract(7, 'day')),
    toApiDate(dayjs('2025-05-18')),
  ]
  let data: GtfsAgencyPydanticModel[] = []
  for (const date of tryDates) {
    try {
      data = await GTFS_API.gtfsAgenciesListGet({ dateFrom: date })
      if (data.length > 0) break
    } catch (err) {
      console.error('Error fetching agencies:', err)
    }
  }
  return data.filter(Boolean)
}

export function getAgencyList() {
  if (!agencyListPromise) {
    agencyListPromise = fetchAgencyList()
  }
  return agencyListPromise
}

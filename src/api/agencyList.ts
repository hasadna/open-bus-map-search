import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { GTFS_API } from './apiConfig'

const cache = new Map<string, Promise<GtfsAgencyPydanticModel[]>>()

async function fetchAgencyList(dateFrom: Date, dateTo: Date) {
  try {
    const data = await GTFS_API.gtfsAgenciesListGet({ dateFrom, dateTo })
    return data.filter(Boolean)
  } catch (err) {
    console.error('Error fetching agencies:', err)
    return []
  }
}

/**
 * Agencies active in the [dateFrom, dateTo] range (pass the same date twice for a single day).
 * Memoized per date range; an empty or failed fetch is not kept, so a later call retries
 * instead of caching a blank list for the rest of the session.
 */
export function getAgencyList(dateFrom: Date, dateTo: Date) {
  const key = `${dateFrom.toISOString().slice(0, 10)}_${dateTo.toISOString().slice(0, 10)}`
  let agencies = cache.get(key)
  if (!agencies) {
    agencies = fetchAgencyList(dateFrom, dateTo)
    cache.set(key, agencies)
    agencies.then((list) => {
      if (list.length === 0) cache.delete(key)
    })
  }
  return agencies
}

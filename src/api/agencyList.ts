import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { GTFS_API } from './apiConfig'

let agencyListPromise: Promise<GtfsAgencyPydanticModel[]> | null = null

// Built per call, not once at module load: a retry hours later (or in a tab left open
// overnight) has to ask about the dates that are recent *now*.
const getTryDates = () => [
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date('2025-05-18'),
]

async function fetchAgencyList() {
  let data: GtfsAgencyPydanticModel[] = []
  for (const date of getTryDates()) {
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
    // An empty list means every attempt failed. Keeping that promise would leave the
    // operator dropdown empty on every page until a full reload, so drop it and let
    // the next caller try again.
    agencyListPromise = fetchAgencyList().then((agencies) => {
      if (agencies.length === 0) {
        agencyListPromise = null
      }
      return agencies
    })
  }
  return agencyListPromise
}

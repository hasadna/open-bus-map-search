import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { GTFS_API } from './apiConfig'

let agencyListPromise: Promise<GtfsAgencyPydanticModel[]> | null = null

const tryDates = [
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date('2025-05-18'),
]

async function fetchAgencyList() {
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

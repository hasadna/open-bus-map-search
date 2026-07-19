import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { addDays, civilDate, civilDateToApiDate, todayCivilDate } from 'src/model/time/civilDate'
import { GTFS_API } from './apiConfig'

let agencyListPromise: Promise<GtfsAgencyPydanticModel[]> | null = null

const tryDates = [
  addDays(todayCivilDate(), -1),
  addDays(todayCivilDate(), -7),
  civilDate('2025-05-18')!,
]

async function fetchAgencyList() {
  let data: GtfsAgencyPydanticModel[] = []
  for (const date of tryDates) {
    try {
      data = await GTFS_API.gtfsAgenciesListGet({ dateFrom: civilDateToApiDate(date) })
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

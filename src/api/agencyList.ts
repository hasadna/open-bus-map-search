import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { GTFS_API } from './apiConfig'


let agencyList: GtfsAgencyPydanticModel[]

const tryDates = [
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date('2025-05-18'),
]

export default async function getAgencyList(): Promise<GtfsAgencyPydanticModel[]> {
  if (!agencyList) {
    let data: GtfsAgencyPydanticModel[] = []
    for (const date of tryDates) {
      try {
        data = await GTFS_API.gtfsAgenciesListGet({ dateFrom: date })
        if (data.length > 0) break
      } catch (err) {
        console.error(err)
      }
    }
    agencyList = data.filter(Boolean)
  }

  return agencyList
}

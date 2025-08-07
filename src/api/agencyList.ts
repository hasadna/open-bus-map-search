import { useEffect, useState } from 'react'
import { GtfsAgencyPydanticModel, GtfsApi } from '@hasadna/open-bus-api-client'
import { API_CONFIG } from './apiConfig'

const GTFS_API = new GtfsApi(API_CONFIG)

let agencyList: GtfsAgencyPydanticModel[]

const tryDates = [
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date('2025-05-18'),
]

/**
 * Fetch agency data from MOT api
 * @returns Agency data array, might contain DUPLICATE agencies with different `date` values
 */
export default async function getAgencyList(): Promise<GtfsAgencyPydanticModel[]> {
  if (!agencyList) {
    let data: GtfsAgencyPydanticModel[] = []
    for (const date of tryDates) {
      try {
        data = await GTFS_API.listGtfsAgenciesListGet({ dateFrom: date })

        if (data.length > 0) break
      } catch (err) {
        console.error(err)
      }
    }
    agencyList = data.filter(Boolean)
  }

  return agencyList
}

export function useAgencyList() {
  const [agencyList, setAgencyList] = useState<GtfsAgencyPydanticModel[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList).catch(console.log)
  }, [])

  return agencyList
}

import { useEffect, useState } from 'react'
import { BASE_PATH } from './apiConfig'
export interface Agency {
  date: string // example - "2019-07-01"
  operator_ref: number // example - 25,
  agency_name: string // example - "אלקטרה אפיקים"
}

let json: Agency[]

export default async function getAgencyList(): Promise<Agency[]> {
  if (!json) {
    const response = await fetch(`${BASE_PATH}/gtfs_agencies/list`)
    json = await response.json()
  }

  return json
}

export function useAgencyList() {
  const [agencyList, setAgencyList] = useState<Agency[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList).catch(console.log)
  }, [])

  return agencyList
}

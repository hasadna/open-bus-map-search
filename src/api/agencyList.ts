import { useEffect, useState } from 'react'
import { STRIDE_API_BASE_PATH } from './apiConfig'
import dayjs from 'src/dayjs'

export interface Agency {
  date: string // example - "2019-07-01"
  operator_ref: number // example - 25,
  agency_name: string // example - "אלקטרה אפיקים"
}

let agencyList: Agency[]

const tryDates = [
  dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  dayjs().subtract(8, 'day').format('YYYY-MM-DD'),
  '2025-05-18',
]

/**
 * Fetch agency data from MOT api
 * @returns Agency data array, might contain DUPLICATE agencies with different `date` values
 */
export default async function getAgencyList(): Promise<Agency[]> {
  if (!agencyList) {
    let data: Agency[] = []
    for (const date of tryDates) {
      try {
        const response = await fetch(`${STRIDE_API_BASE_PATH}/gtfs_agencies/list?date_from=${date}`)
        if (!response.ok) continue
        data = (await response.json()) as Agency[]
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
  const [agencyList, setAgencyList] = useState<Agency[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList).catch(console.log)
  }, [])

  return agencyList
}

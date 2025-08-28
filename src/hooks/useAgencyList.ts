import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { useEffect, useState } from 'react'
import { getAgencyList } from 'src/api/agencyList'

export function useAgencyList() {
  const [agencyList, setAgencyList] = useState<GtfsAgencyPydanticModel[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList).catch(console.log)
  }, [])

  return agencyList
}

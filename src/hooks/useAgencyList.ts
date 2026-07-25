import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { useContext, useEffect, useState } from 'react'
import { getAgencyList } from 'src/api/agencyList'
import { GlobalSearchContext } from 'src/model/globalState'

/** Agencies for the globally-selected day (GlobalSearchState.date). */
export function useAgencyList() {
  const {
    search: { date },
  } = useContext(GlobalSearchContext)
  const [agencyList, setAgencyList] = useState<GtfsAgencyPydanticModel[]>([])

  useEffect(() => {
    let active = true
    const day = new Date(date)
    getAgencyList(day, day)
      .then((list) => {
        if (active) setAgencyList(list)
      })
      .catch(console.log)
    return () => {
      active = false
    }
  }, [date])

  return agencyList
}

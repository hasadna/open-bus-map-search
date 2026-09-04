import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { agencyListForDateQueryOptions } from 'src/api/agencyList'
import { GlobalSearchContext } from 'src/model/globalState'

const NO_AGENCIES: GtfsAgencyPydanticModel[] = []

/** Agencies that ran on the globally selected day (GlobalSearchState.date). */
export function useAgencyList() {
  const {
    search: { date },
  } = useContext(GlobalSearchContext)
  const { data } = useQuery(agencyListForDateQueryOptions(date))

  return data ?? NO_AGENCIES
}

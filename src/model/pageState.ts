import { createContext, Dispatch } from 'react'
import dayjs from 'src/dayjs'
import { BusRoute } from './busRoute'

export type PageSearchState = {
  timestamp: number
  operatorId?: string
  lineNumber?: string
  vehicleNumber?: number
  routeKey?: string
  startTime?: string
  routes?: BusRoute[]
}

type MutateStateAction<S> = (prevState: S) => S

export const SearchContext = createContext<{
  search: PageSearchState
  setSearch: Dispatch<MutateStateAction<PageSearchState>>
}>({ search: { timestamp: dayjs().valueOf() }, setSearch: (search) => search })

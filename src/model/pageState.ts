import { BusRoute } from './busRoute'
import { BusStop } from './busStop'
import { createContext, Dispatch } from 'react'
import moment from 'moment'

export type PageSearchState = {
  timestamp: number
  operatorId?: string
  lineNumber?: string
  routeKey?: string
  routes?: BusRoute[]
}

type MutateStateAction<S> = (prevState: S) => S

export const SearchContext = createContext<{
  search: PageSearchState
  setSearch: Dispatch<MutateStateAction<PageSearchState>>
}>({ search: { timestamp: moment().valueOf() }, setSearch: (search) => search })

export type TimelinePageState = {
  stops?: BusStop[]
  stopKey?: string
  stopName?: string
  gtfsHitTimes?: Date[]
  siriHitTimes?: Date[]
}

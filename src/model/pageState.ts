import { Moment } from 'moment/moment'
import { BusRoute } from './busRoute'
import { BusStop } from './busStop'
import { createContext, Dispatch, SetStateAction } from 'react'
import moment from 'moment'

export type PageSearchState = {
  timestamp: Moment
  operatorId?: string
  lineNumber?: string
  routeKey?: string
  routes?: BusRoute[]
}

type MutateStateAction<S> = (prevState: S) => S

export const SearchContext = createContext<{
  search: PageSearchState
  setSearch: Dispatch<MutateStateAction<PageSearchState>>
}>({ search: { timestamp: moment() }, setSearch: (search) => search })

export type TimelinePageState = {
  stops?: BusStop[]
  stopKey?: string
  stopName?: string
  gtfsHitTimes?: Date[]
  siriHitTimes?: Date[]
}

import { Moment } from 'moment/moment'
import { BusRoute } from './busRoute'
import { BusStop } from './busStop'
import { createContext, Dispatch, SetStateAction } from 'react'
import moment from 'moment'

export type PageSearchState = {
  timestamp: Moment
  operatorId?: string
  lineNumber?: string
}

export const SearchContext = createContext<{
  search: PageSearchState
  setSearch: Dispatch<SetStateAction<PageSearchState>>
}>({ search: { timestamp: moment() }, setSearch: (search) => search })

export type TimelinePageState = {
  routeKey?: string
  routes?: BusRoute[]
  stops?: BusStop[]
  stopKey?: string
  stopName?: string
  gtfsHitTimes?: Date[]
  siriHitTimes?: Date[]
}

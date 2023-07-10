import { BusRoute } from './busRoute'
import { BusStop } from './busStop'
import { createContext, Dispatch } from 'react'
import moment from 'moment'
import {
  GtfsRideStopPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from 'open-bus-stride-client'
import { Coordinates } from './location'

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
  gtfsHitTimes?: GtfsRideStopPydanticModel[]
  siriHitTimes?: SiriVehicleLocationWithRelatedPydanticModel & Coordinates[]
}

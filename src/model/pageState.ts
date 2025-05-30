import {
  GtfsRideStopPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from 'open-bus-stride-client'
import { createContext, Dispatch } from 'react'
import { BusRoute } from './busRoute'
import { BusStop } from './busStop'
import { Coordinates } from './location'
import dayjs from 'src/dayjs'

export type PageSearchState = {
  timestamp: number
  operatorId?: string
  lineNumber?: string
  vehicleNumber?: number
  routeKey?: string
  routes?: BusRoute[]
}

type MutateStateAction<S> = (prevState: S) => S

export const SearchContext = createContext<{
  search: PageSearchState
  setSearch: Dispatch<MutateStateAction<PageSearchState>>
}>({ search: { timestamp: dayjs().valueOf() }, setSearch: (search) => search })

export type TimelinePageState = {
  stops?: BusStop[]
  stopKey?: string
  stopName?: string
  gtfsHitTimes?: GtfsRideStopPydanticModel[]
  siriHitTimes?: SiriVehicleLocationWithRelatedPydanticModel & Coordinates[]
}

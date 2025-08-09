import { SiriVehicleLocationWithRelatedPydanticModel } from 'open-bus-stride-client'
import { BusStop } from 'src/model/busStop'
import { Point } from 'src/pages/timeBasedMap'

export interface Path {
  locations: SiriVehicleLocationWithRelatedPydanticModel[]
  lineRef: number
  operator: number
  vehicleRef: number
}

export interface MapProps {
  positions: Point[]
  plannedRouteStops?: BusStop[]
  showNavigationButtons?: boolean
}

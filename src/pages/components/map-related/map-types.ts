import { BusStop } from 'src/model/busStop'
import { VehicleLocation } from 'src/model/vehicleLocation'
import { Point } from 'src/pages/timeBasedMap'

export interface Path {
  locations: VehicleLocation[]
  lineRef: number
  operator: number
  vehicleRef: number
}

export interface MapProps {
  positions: Point[]
  plannedRouteStops?: BusStop[]
  showNavigationButtons?: boolean
}

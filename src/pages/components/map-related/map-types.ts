import { Point } from 'src/pages/timeBasedMap'
import { BusStop } from 'src/model/busStop'
import { VehicleLocation } from 'src/model/vehicleLocation'

export interface Path {
  locations: VehicleLocation[]
  lineRef: number
  operator: number
  vehicleRef: number
}

export interface MapProps {
  positions: Point[]
  plannedRouteStops: BusStop[]
  showNavigationButtons?: boolean
}

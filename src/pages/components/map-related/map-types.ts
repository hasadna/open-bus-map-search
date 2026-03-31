import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { BusStop } from 'src/model/busStop'

export interface Point {
  loc: [number, number]
  color: number
  operator?: number
  bearing?: number
  point?: SiriVehicleLocationWithRelatedPydanticModel
  recordedAtTime?: number
}

export interface Path {
  locations: SiriVehicleLocationWithRelatedPydanticModel[]
  lineRef: number
  operator: number
  vehicleRef: string
}

export interface MapProps {
  positions: Point[]
  plannedRouteStops?: BusStop[]
  showNavigationButtons?: boolean
}

export function toPoint(location: SiriVehicleLocationWithRelatedPydanticModel): Point {
  return {
    loc: [location.lat ?? 0, location.lon ?? 0],
    color: location.velocity ?? 0,
    operator: location.siriRouteOperatorRef ?? 0,
    bearing: location.bearing ?? 0,
    recordedAtTime: location.recordedAtTime ? new Date(location.recordedAtTime).getTime() : 0,
    point: location,
  }
}

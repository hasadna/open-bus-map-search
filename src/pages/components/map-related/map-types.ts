import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { BusStop } from 'src/model/busStop'

export const ROUTE_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444']

export interface Point {
  loc: [number, number]
  color: number
  operator?: number
  bearing?: number
  point?: SiriVehicleLocationWithRelatedPydanticModel
  recordedAtTime?: number
}

export interface PositionGroup {
  positions: Point[]
  color: string
  label?: string
}

export interface Path {
  locations: SiriVehicleLocationWithRelatedPydanticModel[]
  lineRef: number
  operator: number
  vehicleRef: string
}

export interface MapProps {
  positionGroups: PositionGroup[]
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

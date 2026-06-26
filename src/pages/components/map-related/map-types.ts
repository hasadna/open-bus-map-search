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
  /** Raw SIRI vehicle ref of the ride — used to deep-link the legend to the vehicle page. */
  vehicleRef?: string
}

export interface Path {
  locations: SiriVehicleLocationWithRelatedPydanticModel[]
  lineRef: number
  operator: number
  vehicleRef: string
}

/** A request to fly the map to a location; `seq` bumps so repeated requests for the same
 * location still re-trigger the fly-to (clicking the same ping twice). */
export interface FocusTarget {
  loc: [number, number]
  seq: number
}

export interface MapProps {
  positionGroups: PositionGroup[]
  plannedRouteStops?: BusStop[]
  showNavigationButtons?: boolean
  /** When set/changed, the map flies to this location (e.g. a coverage-gap ping). */
  focusTarget?: FocusTarget | null
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

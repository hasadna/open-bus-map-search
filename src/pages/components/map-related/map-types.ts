import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { BusStop } from 'src/model/busStop'

/** Deliberately no red — that belongs to the ping speed ramp (`.ping-arrow--slow`), and red
 * arrows over a red line read as neither. */
export const ROUTE_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#0891b2']

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
  /** When set, the ping's popup is opened too, addressed by its place in `positionGroups`. */
  marker?: { groupIndex: number; positionIndex: number }
}

export interface MapProps {
  positionGroups: PositionGroup[]
  plannedRouteStops?: BusStop[]
  showNavigationButtons?: boolean
  /** When set/changed, the map flies to this location (e.g. a coverage-gap ping). */
  focusTarget?: FocusTarget | null
}

/**
 * Identity of a physical GPS fix, for deduplication.
 *
 * The API re-emits one fix across consecutive per-minute snapshots — same vehicle, time and
 * position, but a fresh row `id` every time — so keying on `id` collapses nothing. Rows sharing
 * a timestamp but holding *different* positions are deliberately kept: the key cannot know
 * which of them is the true position.
 */
export function locationFixKey({
  siriRideVehicleRef,
  recordedAtTime,
  lat,
  lon,
}: SiriVehicleLocationWithRelatedPydanticModel) {
  return `${siriRideVehicleRef}-${new Date(recordedAtTime ?? 0).getTime()}-${lat}-${lon}`
}

/**
 * Find a ping by its `locationFixKey` — how a deep link (e.g. from /timeline) names one
 * specific GPS fix of a ride.
 *
 * The fix key, not the row `id`, is the identity that survives the trip: the API re-emits
 * the same fix under a fresh `id` every snapshot, and `uniqBy(locationFixKey)` keeps an
 * arbitrary one of those rows — so the id the linking page saw may be gone from the list.
 */
export function findPositionByFixKey(
  positionGroups: PositionGroup[],
  fixKey: string,
): { groupIndex: number; positionIndex: number; loc: [number, number] } | null {
  for (let groupIndex = 0; groupIndex < positionGroups.length; groupIndex++) {
    const positions = positionGroups[groupIndex].positions
    const positionIndex = positions.findIndex(
      (position) => position.point && locationFixKey(position.point) === fixKey,
    )
    if (positionIndex !== -1) {
      return { groupIndex, positionIndex, loc: positions[positionIndex].loc }
    }
  }
  return null
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

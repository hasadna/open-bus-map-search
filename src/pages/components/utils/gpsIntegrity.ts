import { getDistance } from 'geolib'
import { Point } from 'src/pages/components/map-related/map-types'

/**
 * Israel and its immediate approaches. A SIRI fix outside this is not a position the vehicle
 * could hold: the dominant value by far is Beirut airport (33.8186, 35.4963), the standard
 * GPS-spoofing target, which on a bad day carries hundreds of a ride's pings.
 */
export const ISRAEL_BOUNDS = { minLat: 29.0, maxLat: 33.5, minLon: 34.0, maxLon: 36.3 }

/**
 * Ground speed (km/h) past which a pair of fixes describes a reporting artifact rather than
 * movement. Measured over June 2026 rides *after* the bounds filter: buses peak near 107 and
 * trains near 249, while a stale fix released late reads as hundreds to thousands. Trains sit
 * closest to the line, so the threshold clears their real top speed rather than splitting it.
 */
export const MAX_PLAUSIBLE_KMH = 250

/** MOT's "no position" sentinel — the schedule announcing a trip, not a vehicle reporting. */
const NO_FIX_COORDINATE = -1

export function isNoFixLocation([lat, lon]: [number, number]) {
  return lat === NO_FIX_COORDINATE && lon === NO_FIX_COORDINATE
}

export function isPlausibleLocation([lat, lon]: [number, number]) {
  return (
    lat >= ISRAEL_BOUNDS.minLat &&
    lat <= ISRAEL_BOUNDS.maxLat &&
    lon >= ISRAEL_BOUNDS.minLon &&
    lon <= ISRAEL_BOUNDS.maxLon
  )
}

/**
 * Speed implied by treating two fixes as one movement, or `undefined` when their timestamps
 * can't order them. Two *different* positions sharing a timestamp yield `Infinity` — the pair
 * is unusable as motion, and saying so is what keeps it out of the confident route.
 */
export function impliedSpeedKmh(from: Point, to: Point): number | undefined {
  const elapsedMs = (to.recordedAtTime ?? 0) - (from.recordedAtTime ?? 0)
  if (!from.recordedAtTime || !to.recordedAtTime || elapsedMs < 0) return undefined
  const meters = getDistance(
    { latitude: from.loc[0], longitude: from.loc[1] },
    { latitude: to.loc[0], longitude: to.loc[1] },
  )
  if (elapsedMs === 0) return meters === 0 ? 0 : Infinity
  return meters / 1000 / (elapsedMs / 3_600_000)
}

/**
 * `unverifiable` is not "fine": the pair carries no usable clock, so nothing says the vehicle
 * covered that ground. `recorded_at_time` is non-optional in the stride API, so this needs the
 * generated client (which marks every field optional) to be wrong about a row — but a caller
 * that folds it in with `plausible` would assert movement it never checked.
 */
export type Movement = 'plausible' | 'impossible' | 'unverifiable'

export function classifyMovement(from: Point, to: Point): Movement {
  const speed = impliedSpeedKmh(from, to)
  if (speed === undefined) return 'unverifiable'
  return speed > MAX_PLAUSIBLE_KMH ? 'impossible' : 'plausible'
}

/**
 * A ride's fixes split by whether each is a position the vehicle could hold.
 *
 * Deliberately separate from {@link classifyMovement}: a fix *outside the country* is no
 * position at all and leaves the route entirely, while a pair implying an impossible speed holds
 * two positions that may both be real — Israel Railways re-stamps a stale fix with a fresh
 * clock, so the jump is the report's fault, not the train's. Dropping those would erase the train.
 */
export function partitionByPlausibility(positions: Point[]) {
  const plausible: Point[] = []
  const implausible: Point[] = []
  for (const position of positions) {
    ;(isPlausibleLocation(position.loc) ? plausible : implausible).push(position)
  }
  return { plausible, implausible }
}

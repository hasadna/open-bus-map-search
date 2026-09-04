import { getDistance } from 'geolib'
import { Point } from 'src/pages/components/map-related/map-types'

/**
 * Where Israeli public transport actually runs — a service envelope, not a border. A SIRI fix
 * outside it is not a position the vehicle could hold; spoofing parks vehicles on international
 * airports, and the two that matter are Beirut (33.8186, 35.4963) and **Amman Queen Alia**
 * (31.7226, 35.9932).
 *
 * `maxLon` is the load-bearing edge and is deliberately tight. Amman sits at lon ~35.99, so the
 * once-generous 36.3 admitted it as real route: over 120k fixes sampled across 2026-06-08/10/14
 * it drew 1,803 spoofed fixes (1.5%) for 226 rides and 215 vehicles across 8 operators as
 * genuine track. Real service runs no further east than **35.836** (upper Golan) while the
 * Amman cluster starts at **35.984**, so any cutoff in between separates them; 35.9 splits it.
 */
export const ISRAEL_BOUNDS = { minLat: 29.0, maxLat: 33.5, minLon: 34.0, maxLon: 35.9 }

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

/**
 * The fixes that form the ride itself: the largest group whose members are joined to one
 * another by movement the vehicle could actually have made.
 *
 * Trust does not survive an impossible jump. A cluster on the far side of one holds positions
 * inside the bounds that look perfectly ordinary among themselves — spoofing that lands in
 * Jordan reports a stationary vehicle quite happily — but nothing except the report says the
 * vehicle was ever there, so it is not the route and must not carry the ride's start or end.
 * Ties keep the earlier group, so a ride is never re-anchored onto a later cluster of equal size.
 */
export function rideBody(positions: Point[]): Point[] {
  const groups: Point[][] = []
  for (const position of positions) {
    if (!isPlausibleLocation(position.loc)) continue
    const open = groups.at(-1)
    if (open && classifyMovement(open[open.length - 1], position) !== 'impossible')
      open.push(position)
    else groups.push([position])
  }
  return groups.reduce<Point[]>((best, group) => (group.length > best.length ? group : best), [])
}

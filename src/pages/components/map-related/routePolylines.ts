/**
 * Turns a ride's fixes into the polylines the map draws them as. The judgements themselves —
 * is this a position the vehicle could hold, could it have moved between these two — belong to
 * `utils/gpsIntegrity`; this module only decides what gets drawn, and how.
 */
import { classifyMovement, isPlausibleLocation, rideBody } from '../utils/gpsIntegrity'
import type { Point } from './map-types'

export interface RoutePath {
  /** Dashed where the movement it spans is impossible, or where no clock could confirm it. */
  dashed: boolean
  positions: [number, number][]
}

export interface RoutePolylines {
  /** The route through holdable positions, short-circuiting straight over the rest. */
  route: RoutePath[]
  /** One path per run of excluded fixes, anchored to the fix either side — the route as claimed. */
  claimed: [number, number][][]
  /** From {@link rideBody}, so callers place the ride's bookends on the same fixes drawn solid. */
  body: Point[]
}

function toRoute(plausible: Point[], body: ReadonlySet<Point>): RoutePath[] {
  const route: RoutePath[] = []
  for (let i = 1; i < plausible.length; i++) {
    // Solid needs both a movement the data supports and two fixes that belong to the ride:
    // `impossible`/`unverifiable` cannot carry a line, and neither can a stretch of a cluster
    // that only an impossible jump reaches, however placid it looks from the inside.
    const dashed =
      classifyMovement(plausible[i - 1], plausible[i]) !== 'plausible' ||
      !body.has(plausible[i - 1]) ||
      !body.has(plausible[i])
    const open = route.at(-1)
    if (open?.dashed === dashed) open.positions.push(plausible[i].loc)
    else route.push({ dashed, positions: [plausible[i - 1].loc, plausible[i].loc] })
  }
  return route
}

function toClaimed(positions: Point[]): [number, number][][] {
  const claimed: [number, number][][] = []
  let run: Point[] = []
  let previousPlausible: Point | undefined

  const closeRun = (next?: Point) => {
    if (!run.length) return
    claimed.push([
      ...(previousPlausible ? [previousPlausible.loc] : []),
      ...run.map((point) => point.loc),
      ...(next ? [next.loc] : []),
    ])
    run = []
  }

  for (const point of positions) {
    if (isPlausibleLocation(point.loc)) {
      closeRun(point)
      previousPlausible = point
    } else {
      run.push(point)
    }
  }
  closeRun()
  return claimed
}

export function buildRoutePolylines(positions: Point[]): RoutePolylines {
  const body = rideBody(positions)
  return {
    route: toRoute(
      positions.filter((point) => isPlausibleLocation(point.loc)),
      new Set(body),
    ),
    claimed: toClaimed(positions),
    body,
  }
}

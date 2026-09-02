/**
 * Turns a ride's fixes into the polylines the map draws them as. The judgements themselves —
 * is this a position the vehicle could hold, could it have moved between these two — belong to
 * `utils/gpsIntegrity`; this module only decides what gets drawn, and how.
 */
import { classifyMovement, isPlausibleLocation } from '../utils/gpsIntegrity'
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
}

function toRoute(plausible: Point[]): RoutePath[] {
  const route: RoutePath[] = []
  for (let i = 1; i < plausible.length; i++) {
    // Only a movement the data actually supports gets a solid line; `impossible` and
    // `unverifiable` alike mean the pair cannot carry one, and dashed says exactly that.
    const dashed = classifyMovement(plausible[i - 1], plausible[i]) !== 'plausible'
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
  return {
    route: toRoute(positions.filter((point) => isPlausibleLocation(point.loc))),
    claimed: toClaimed(positions),
  }
}

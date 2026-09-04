import { Page } from '@playwright/test'
import { FIXTURE_DATE, israelTime, siriWindow } from './fixtures/date'
import { gtfsRoute, gtfsRoutesWire } from './fixtures/gtfs'
import { siriRide, siriRidesWire } from './fixtures/siri'
import { okStub, routeStride } from './fixtures/stride'

export const VEHICLE_NUMBER = '7489226'

// The stride request URLs the vehicle page issues under the frozen fixture clock. The
// SHAPE is captured from a real run; the DATES are derived from FIXTURE_DATE (tests/fixtures/
// date.ts) so it stays the one knob. Full-URL matching is mandatory (tests/fixtures/stride.ts),
// so these are exact: if the page's request changes (wrong date window, limit, order, operator)
// the stub stops matching and the test fails loudly instead of silently passing.
//
// Exported because a URL is the handle a test overrides a stub by: `vehicleUrls.rides` is what
// the empty-state and load-error tests re-stub, leaving every other stub in place.
const { from: siriFrom, to: siriTo } = siriWindow()

// The page fetches GTFS routes once per DISTINCT operator in the rides (97 and 3) — two
// separate requests the old fuzzy matcher served the same body. Each gets its own.
//
// The date is FIXTURE_DATE itself, NOT the day before: the page anchors the selected date at
// UTC noon (`utcNoonForDateStr`, src/dayjs.ts) before the gtfs client serializes it as a UTC
// calendar date, so it survives intact. Anchoring at Israel-midnight instead serializes to
// 22:00Z the previous day and queries the wrong GTFS day — the bug #1689 fixed, and the
// off-by-one this fixture carried until it was caught by an unmocked-request failure.
const gtfsRoutesUrl = (operatorRef: number) =>
  `/gtfs_routes/list?limit=15000&date_from=${FIXTURE_DATE}&date_to=${FIXTURE_DATE}` +
  `&operator_refs=${operatorRef}&order_by=route_long_name asc`

export const vehicleUrls = {
  rides:
    `/siri_rides/list?limit=500&vehicle_refs=${VEHICLE_NUMBER}` +
    `&scheduled_start_time_from=${siriFrom}` +
    `&scheduled_start_time_to=${siriTo}` +
    '&order_by=scheduled_start_time asc',
  gtfsRoutes: gtfsRoutesUrl,
}

/**
 * The designed /vehicle scenario. The rides intentionally carry NO gtfs_route__* fields —
 * that is the case the page exists to handle: the human line number and route names are
 * resolved from the operator's GTFS routes (below), keyed by line ref.
 */
const SIRI_RIDES = [
  // line 16, 04:30 Israel time — fully resolvable, linkable (operator 97)
  siriRide({
    id: 62029001,
    vehicleRef: VEHICLE_NUMBER,
    siriRouteLineRef: 28099,
    siriRouteOperatorRef: 97,
    scheduledStartTime: israelTime(4, 30),
  }),
  // line ref 99999 has no matching GTFS route — must render as dashes, no link (operator 3)
  siriRide({
    id: 62029002,
    vehicleRef: VEHICLE_NUMBER,
    siriRouteLineRef: 99999,
    siriRouteOperatorRef: 3,
    scheduledStartTime: israelTime(8, 0),
  }),
  // line 17, 23:30 Israel time — the last departure of the day (operator 97)
  siriRide({
    id: 62029003,
    vehicleRef: VEHICLE_NUMBER,
    siriRouteLineRef: 28100,
    siriRouteOperatorRef: 97,
    scheduledStartTime: israelTime(23, 30),
  }),
]

// Operator 97's routes resolve lines 16 and 17. Operator 3 has no route for line 99999,
// so its query returns an empty list — which is why that ride renders unresolved.
const OPERATOR_97_ROUTES = [
  gtfsRoute({
    id: 4339841,
    lineRef: 28099,
    operatorRef: 97,
    routeShortName: '16',
    routeLongName: 'תל אביב<->ירושלים-1#',
    routeMkt: '52016',
    routeDirection: '1',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  }),
  gtfsRoute({
    id: 4339842,
    lineRef: 28100,
    operatorRef: 97,
    routeShortName: '17',
    routeLongName: 'חיפה<->אילת-2#',
    routeMkt: '52017',
    routeDirection: '2',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  }),
]

/**
 * The /vehicle scenario: one stub per URL the page calls, layered over the defaults. A test
 * that needs a different response for one of them re-stubs that URL by itself — see the
 * empty-state and load-error tests in vehicle.spec.ts — so this stays a plain description of
 * the happy path with no per-variation options bag.
 */
export async function mockVehicleApi(page: Page) {
  await routeStride(page, [
    okStub(vehicleUrls.rides, siriRidesWire(SIRI_RIDES)),
    okStub(vehicleUrls.gtfsRoutes(97), gtfsRoutesWire(OPERATOR_97_ROUTES)),
    okStub(vehicleUrls.gtfsRoutes(3), gtfsRoutesWire([])),
  ])
}

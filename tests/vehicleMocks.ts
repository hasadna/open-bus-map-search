import { SiriRideWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { Page } from '@playwright/test'
import { gtfsDay, israelServiceTime, siriWindow } from './fixtures/date'
import { gtfsRoute, gtfsRoutesWire } from './fixtures/gtfs'
import { siriRide, siriRidesWire } from './fixtures/siri'
import { errorStub, okStub, routeStride } from './fixtures/stride'

export const VEHICLE_NUMBER = '7489226'

// The stride request URLs the vehicle page issues under the frozen fixture clock. The
// SHAPE is captured from a real run; the DATES are derived from FIXTURE_DATE (tests/fixtures/
// date.ts) so it stays the one knob. Full-URL matching is mandatory (tests/fixtures/stride.ts),
// so these are exact: if the page's request changes (wrong date window, limit, order, operator)
// the stub stops matching and the test fails loudly instead of silently passing.
const { from: siriFrom, to: siriTo } = siriWindow()
const SIRI_RIDES_URL =
  `/siri_rides/list?limit=500&vehicle_refs=${VEHICLE_NUMBER}` +
  `&scheduled_start_time_from=${siriFrom}` +
  `&scheduled_start_time_to=${siriTo}` +
  '&order_by=scheduled_start_time asc'

// The page fetches GTFS routes once per DISTINCT operator in the rides (97 and 3) — two
// separate requests the old fuzzy matcher served the same body. Each gets its own. (gtfsDay
// is FIXTURE_DATE minus one — the vehicle page's service-day-start Date serializes to the
// previous UTC calendar date; see tests/fixtures/date.ts.)
const gtfsRoutesUrl = (operatorRef: number) =>
  `/gtfs_routes/list?limit=15000&date_from=${gtfsDay()}&date_to=${gtfsDay()}` +
  `&operator_refs=${operatorRef}&order_by=route_long_name asc`

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
    scheduledStartTime: israelServiceTime(4, 30),
  }),
  // line ref 99999 has no matching GTFS route — must render as dashes, no link (operator 3)
  siriRide({
    id: 62029002,
    vehicleRef: VEHICLE_NUMBER,
    siriRouteLineRef: 99999,
    siriRouteOperatorRef: 3,
    scheduledStartTime: israelServiceTime(8, 0),
  }),
  // line 17, 00:30 Israel time the NEXT calendar day — the post-midnight tail of this
  // service day, must show the moon prefix (operator 97)
  siriRide({
    id: 62029003,
    vehicleRef: VEHICLE_NUMBER,
    siriRouteLineRef: 28100,
    siriRouteOperatorRef: 97,
    scheduledStartTime: israelServiceTime(0, 30, { nextDay: true }),
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
 * Stub the stride endpoints the vehicle page calls. `rides`/`ridesStatus` let a test swap
 * in an empty list or an error to exercise the not-found and load-error states.
 */
export async function mockVehicleApi(
  page: Page,
  opts: { rides?: SiriRideWithRelatedPydanticModel[]; ridesStatus?: number } = {},
) {
  await routeStride(page, [
    opts.ridesStatus && opts.ridesStatus >= 400
      ? errorStub(SIRI_RIDES_URL, opts.ridesStatus)
      : okStub(SIRI_RIDES_URL, siriRidesWire(opts.rides ?? SIRI_RIDES)),
    okStub(gtfsRoutesUrl(97), gtfsRoutesWire(OPERATOR_97_ROUTES)),
    okStub(gtfsRoutesUrl(3), gtfsRoutesWire([])),
  ])
}

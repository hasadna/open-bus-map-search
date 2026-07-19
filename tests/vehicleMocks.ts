import { Page } from '@playwright/test'

export const VEHICLE_NUMBER = '7489226'

/**
 * Deterministic stride-api fixtures for the /vehicle page, in the wire (snake_case)
 * format the open-bus-api-client deserializes — the same field names the real
 * endpoints return (see tests/HAR/singleline.har). Kept hand-written and minimal so
 * the page's transform is what gets asserted, not live data.
 *
 * The rides intentionally carry NO gtfs_route__* fields (null) — that is the case
 * the page exists to handle: the human line number and route names are resolved from
 * the operator's GTFS routes, keyed by line ref.
 */
const SIRI_RIDES = [
  // line 16, 04:30 Israel time — fully resolvable, linkable
  {
    id: 62029001,
    vehicle_ref: VEHICLE_NUMBER,
    siri_route__line_ref: 28099,
    siri_route__operator_ref: 97,
    gtfs_route__line_ref: null,
    gtfs_route__operator_ref: null,
    scheduled_start_time: '2024-02-12T02:30:00+00:00',
  },
  // line ref 99999 has no matching GTFS route — must render as dashes, no link
  {
    id: 62029002,
    vehicle_ref: VEHICLE_NUMBER,
    siri_route__line_ref: 99999,
    siri_route__operator_ref: 3,
    gtfs_route__line_ref: null,
    gtfs_route__operator_ref: null,
    scheduled_start_time: '2024-02-12T06:00:00+00:00', // 08:00 Israel time
  },
  // line 17, 00:30 Israel time the NEXT calendar day — the post-midnight tail of
  // this service day, must show the moon prefix
  {
    id: 62029003,
    vehicle_ref: VEHICLE_NUMBER,
    siri_route__line_ref: 28100,
    siri_route__operator_ref: 97,
    gtfs_route__line_ref: null,
    gtfs_route__operator_ref: null,
    scheduled_start_time: '2024-02-12T22:30:00+00:00',
  },
]

const GTFS_ROUTES = [
  {
    id: 4339841,
    line_ref: 28099,
    operator_ref: 97,
    route_short_name: '16',
    route_long_name: 'תל אביב<->ירושלים-1#',
    route_mkt: '52016',
    route_direction: '1',
    route_alternative: '#',
    agency_name: 'אגד',
    date: '2024-02-12',
    route_type: 3,
  },
  {
    id: 4339842,
    line_ref: 28100,
    operator_ref: 97,
    route_short_name: '17',
    route_long_name: 'חיפה<->אילת-2#',
    route_mkt: '52017',
    route_direction: '2',
    agency_name: 'אגד',
    route_alternative: '#',
    date: '2024-02-12',
    route_type: 3,
  },
]

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

/**
 * Stub the two endpoints the vehicle page calls. Register AFTER setupTest so these
 * handlers take precedence over its blanket stride-api abort (Playwright matches
 * routes in reverse registration order).
 */
export async function mockVehicleApi(
  page: Page,
  opts: { rides?: unknown[]; ridesStatus?: number } = {},
) {
  await page.route(/\/siri_rides\/list/, (route) => {
    if (opts.ridesStatus && opts.ridesStatus >= 400) {
      return route.fulfill({
        status: opts.ridesStatus,
        contentType: 'application/json',
        body: '{}',
      })
    }
    return route.fulfill(json(opts.rides ?? SIRI_RIDES))
  })
  await page.route(/\/gtfs_routes\/list/, (route) => route.fulfill(json(GTFS_ROUTES)))
}

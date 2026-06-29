import {
  GtfsRoutePydanticModel,
  SiriRideWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { getServiceDayTimeBounds, ISRAEL_TIMEZONE } from 'src/dayjs'
import dayjs from 'src/dayjs'
import { fromGtfsRoute } from 'src/model/busRoute'
import { buildVehicleRideRows, ResolvedRoute } from './buildVehicleRideRows'

const DATE = '2024-02-12'
const { start: serviceDayStart } = getServiceDayTimeBounds(DATE)

// A GTFS route as the API returns it (camelCase). lineRef is the SIRI rides'
// join key; routeLongName uses the "<->" separator routeStartEnd splits on.
const makeRoute = (overrides: Partial<GtfsRoutePydanticModel>): GtfsRoutePydanticModel =>
  ({
    id: 4339841,
    date: new Date('2024-02-12T00:00:00Z'),
    lineRef: 28099,
    operatorRef: 97,
    routeShortName: '16',
    routeLongName: 'מוצא א<->יעד א-1#',
    routeMkt: '52016',
    routeDirection: '1',
    routeAlternative: '#',
    agencyName: 'חברה כלשהי',
    routeType: 3,
    ...overrides,
  }) as GtfsRoutePydanticModel

// Build the lineRef->route map exactly the way the page does, so fromGtfsRoute
// (origin/destination parsing, route key) is exercised, not re-implemented.
const routeMap = (routes: GtfsRoutePydanticModel[]): Map<string, ResolvedRoute> =>
  new Map(routes.map((r) => [String(r.lineRef), { ...fromGtfsRoute(r), agencyName: r.agencyName }]))

const makeRide = (
  overrides: Partial<SiriRideWithRelatedPydanticModel>,
): SiriRideWithRelatedPydanticModel => ({
  id: 1,
  vehicleRef: '7489226',
  siriRouteLineRef: 28099,
  siriRouteOperatorRef: 97,
  scheduledStartTime: new Date('2024-02-12T02:30:00Z'), // 04:30 Israel time, same service day
  ...overrides,
})

describe('buildVehicleRideRows', () => {
  it('resolves operator, line, origin and destination from the route matched by line ref', () => {
    const rows = buildVehicleRideRows({
      rides: [makeRide({})],
      routeByLineRef: routeMap([makeRoute({})]),
      serviceDayStart,
      date: DATE,
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      id: 1,
      operator: 'חברה כלשהי',
      lineNumber: '16',
      origin: 'מוצא א',
      destination: 'יעד א',
      displayTime: '04:30',
    })
  })

  it('builds a single-line-map link carrying the route identity and dash-formatted ride time', () => {
    const [row] = buildVehicleRideRows({
      rides: [makeRide({})],
      routeByLineRef: routeMap([makeRoute({})]),
      serviceDayStart,
      date: DATE,
    })

    expect(row.setSearchPayload).toEqual({
      operatorId: '97',
      lineNumber: '16',
      routeKey: '52016-1-#', // routeMkt-routeDirection-routeAlternative
      rideTime: '04-30', // colons become dashes for the query param
    })

    const url = new URL(row.href!, 'https://example.com')
    expect(url.pathname).toBe('/single-line-map')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      date: DATE,
      operatorId: '97',
      lineNumber: '16',
      routeKey: '52016-1-#',
      rideTime: '04-30',
    })
  })

  it('marks a past-midnight departure with the moon prefix and wall-clock time', () => {
    const [row] = buildVehicleRideRows({
      // 00:30 Israel time on 2024-02-13 — the late-night tail of the 2024-02-12 service day
      rides: [makeRide({ scheduledStartTime: new Date('2024-02-12T22:30:00Z') })],
      routeByLineRef: routeMap([makeRoute({})]),
      serviceDayStart,
      date: DATE,
    })

    expect(row.displayTime).toBe('🌙 00:30')
    // the extended-hour token (24:30) must not leak into the human display
    expect(row.displayTime).not.toContain('24:30')
  })

  it('falls back to dashes and produces no link when the line ref has no matching route', () => {
    const [row] = buildVehicleRideRows({
      rides: [makeRide({ siriRouteLineRef: 99999, siriRouteOperatorRef: 3 })],
      routeByLineRef: routeMap([makeRoute({})]), // only line ref 28099 is known
      serviceDayStart,
      date: DATE,
    })

    expect(row).toMatchObject({
      operator: '3', // falls back to the raw operator ref when no route resolved
      lineNumber: '—',
      origin: '—',
      destination: '—',
    })
    expect(row.href).toBeUndefined()
    expect(row.setSearchPayload).toBeUndefined()
  })

  it('resolves the route via gtfsRouteLineRef when siriRouteLineRef is absent', () => {
    const [row] = buildVehicleRideRows({
      rides: [makeRide({ siriRouteLineRef: undefined, gtfsRouteLineRef: 28099 })],
      routeByLineRef: routeMap([makeRoute({})]),
      serviceDayStart,
      date: DATE,
    })

    expect(row.lineNumber).toBe('16')
    expect(row.setSearchPayload?.routeKey).toBe('52016-1-#')
  })

  it('drops rides without an id (cannot be keyed or selected)', () => {
    const rows = buildVehicleRideRows({
      rides: [makeRide({ id: undefined }), makeRide({ id: 2 })],
      routeByLineRef: routeMap([makeRoute({})]),
      serviceDayStart,
      date: DATE,
    })

    expect(rows.map((r) => r.id)).toEqual([2])
  })

  it('returns an empty array for undefined rides', () => {
    expect(
      buildVehicleRideRows({
        rides: undefined,
        routeByLineRef: undefined,
        serviceDayStart: dayjs.tz(DATE, ISRAEL_TIMEZONE).startOf('day'),
        date: DATE,
      }),
    ).toEqual([])
  })
})

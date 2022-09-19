import { Configuration, GtfsApi } from 'open-bus-stride-client'
import agencyList from 'open-bus-stride-client/agencies/agencyList'
import moment, { Moment } from 'moment'
import { fromGtfsRoute, BusRoute } from 'src/model/busRoute'
import { BusStop, fromGtfsStop } from 'src/model/busStop'

//const BASE_PATH = "https://open-bus-stride-api.hasadna.org.il";
const BASE_PATH = 'http://localhost:3000/api'
const API_CONFIG = new Configuration({ basePath: BASE_PATH })
const GTFS_API = new GtfsApi(API_CONFIG)

export async function getRoutesAsync(
  date: Date,
  operatorId: string,
  lineNumber: string,
): Promise<BusRoute[]> {
  console.log('looking up routes', operatorId, lineNumber)
  const gtfsRoutes = await GTFS_API.gtfsRoutesListGet({
    routeShortName: lineNumber,
    operatorRefs: operatorId,
    dateFrom: date,
    dateTo: date,
    limit: 100,
  })
  const routes = Object.values(
    gtfsRoutes
      .map((route) => fromGtfsRoute(route))
      .reduce((agg, line) => {
        const groupByKey = line.key
        const prevLine = agg[groupByKey] || { routeIds: [] }
        agg[groupByKey] = {
          ...line,
          ...prevLine,
          routeIds: [...prevLine.routeIds, ...line.routeIds],
        }
        return agg
      }, {} as Record<string, BusRoute>),
  )
  console.log('fetched routes', routes.length)
  return routes
}

export async function getStopsForRouteAsync(
  routeIds: number[],
  moment: Moment,
): Promise<BusStop[]> {
  console.log('looking up stops', routeIds)
  const stops: BusStop[] = []
  for (const routeId of routeIds) {
    const rides = await GTFS_API.gtfsRidesListGet({
      gtfsRouteId: routeId,
      startTimeTo: moment.add(1, 'd').toDate(),
      startTimeFrom: moment.subtract(1, 'd').toDate(),
      limit: 1,
      orderBy: 'start_time',
    })
    if (rides.length === 0) {
      continue
    }
    const rideRepresentative = rides[0]
    const rideStops = await GTFS_API.gtfsRideStopsListGet({
      gtfsRideIds: rideRepresentative.id!.toString(),
    })
    for (const rideStop of rideStops) {
      const stop = await GTFS_API.gtfsStopsGetGet({ id: rideStop.gtfsStopId })
      stops.push(fromGtfsStop(rideStop, stop))
    }
  }
  console.log('fetched stops', stops.length)
  return stops.sort((a, b) =>
    a.stopSequence === b.stopSequence
      ? a.name.localeCompare(b.name)
      : a.stopSequence - b.stopSequence,
  )
}

export async function getStops(BASELINE_TIME: Date) {
  const routes = await GTFS_API.gtfsRoutesListGet({
    routeShortName: '1',
    operatorRefs: agencyList.find((value) => value.agency_name === 'דן')!.agency_id,
    dateFrom: BASELINE_TIME,
    dateTo: BASELINE_TIME,
    limit: 10,
  })
  console.error(routes.map((route) => [route.id, route.routeDirection, route.routeLongName]))

  const route_id = routes[0].id
  const rides = await GTFS_API.gtfsRidesListGet({
    gtfsRouteId: route_id,
    startTimeTo: moment(BASELINE_TIME).add(60, 'm').toDate(),
    startTimeFrom: moment(BASELINE_TIME).subtract(60, 'm').toDate(),
    limit: 10,
    orderBy: 'start_time',
  })
  console.error(rides.map((ride) => ride.startTime))

  const ride_id = rides[0].id?.toString()
  const stops = await GTFS_API.gtfsRideStopsListGet({
    gtfsRideIds: ride_id,
  })

  for (const ride_stop of stops.sort((a, b) => a.stopSequence! - b.stopSequence!)) {
    const stop = await GTFS_API.gtfsStopsGetGet({ id: ride_stop.gtfsStopId })
    console.error(stop.name, stop.code, ride_stop.arrivalTime)
  }
}

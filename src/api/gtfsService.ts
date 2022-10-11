import { Configuration, GtfsApi, GtfsRideWithRelatedPydanticModel } from 'open-bus-stride-client'
import moment, { Moment } from 'moment'
import { BusRoute, fromGtfsRoute } from 'src/model/busRoute'
import { BusStop, fromGtfsStop } from 'src/model/busStop'

//const BASE_PATH = "https://open-bus-stride-api.hasadna.org.il";
const BASE_PATH = 'http://localhost:3000/api'
const API_CONFIG = new Configuration({ basePath: BASE_PATH })
const GTFS_API = new GtfsApi(API_CONFIG)
const JOIN_SEPARATOR = ','
export const MAX_HITS_COUNT = 16

export async function getRoutesAsync(
  timestamp: Moment,
  operatorId: string,
  lineNumber: string,
): Promise<BusRoute[]> {
  console.log('looking up routes', operatorId, lineNumber)
  const gtfsRoutes = await GTFS_API.gtfsRoutesListGet({
    routeShortName: lineNumber,
    operatorRefs: operatorId,
    dateFrom: timestamp.toDate(),
    dateTo: timestamp.toDate(),
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
  timestamp: Moment,
): Promise<BusStop[]> {
  console.log('looking up stops', routeIds)
  const stops: BusStop[] = []

  for (const routeId of routeIds) {
    const rides = await GTFS_API.gtfsRidesListGet({
      gtfsRouteId: routeId,
      startTimeFrom: moment(timestamp).subtract(1, 'days').toDate(),
      startTimeTo: moment(timestamp).add(1, 'days').toDate(),
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
      stops.push(fromGtfsStop(rideStop, stop, rideRepresentative))
    }
  }
  console.log('fetched stops', stops.length)
  return stops.sort((a, b) =>
    a.stopSequence === b.stopSequence
      ? a.name.localeCompare(b.name)
      : a.stopSequence - b.stopSequence,
  )
}

export async function getStopHitTimesAsync(stop: BusStop, timestamp: Moment): Promise<Date[]> {
  const targetStartTime = moment(timestamp).subtract(stop.minutesFromRouteStartTime, 'minutes')
  console.log('looking for rides starting around', targetStartTime.toDate())

  const rides = await GTFS_API.gtfsRidesListGet({
    gtfsRouteId: stop.routeId,
    startTimeFrom: moment(targetStartTime).subtract(2, 'hours').toDate(),
    startTimeTo: moment(targetStartTime).add(2, 'hours').toDate(),
    limit: 512,
    orderBy: 'start_time asc',
  })

  if (rides.length === 0) {
    return []
  }

  const diffFromTargetStart = (ride: GtfsRideWithRelatedPydanticModel): number =>
    Math.abs(timestamp.diff(ride.startTime, 'seconds'))

  const closestRides = rides
    .sort((a, b) => diffFromTargetStart(a) - diffFromTargetStart(b))
    .slice(0, MAX_HITS_COUNT)

  const rideIds = closestRides.map((ride) => ride.id).join(JOIN_SEPARATOR)
  const stopHits = await GTFS_API.gtfsRideStopsListGet({
    gtfsRideIds: rideIds,
    gtfsStopIds: stop.stopId.toString(),
  })
  return stopHits.map((hit) => hit.arrivalTime!).sort()
}

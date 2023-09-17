import { GtfsApi, GtfsRideWithRelatedPydanticModel } from 'open-bus-stride-client'
import moment, { Moment } from 'moment'
import { BusRoute, fromGtfsRoute } from 'src/model/busRoute'
import { BusStop, fromGtfsStop } from 'src/model/busStop'
import { API_CONFIG, MAX_HITS_COUNT } from 'src/api/apiConfig'
import { log } from 'src/log'

const GTFS_API = new GtfsApi(API_CONFIG)
//const USER_CASES_API = new UserCasesApi(API_CONFIG)
const JOIN_SEPARATOR = ','
const SEARCH_MARGIN_HOURS = 4

export async function getRoutesAsync(
  timestamp: Moment,
  operatorId: string,
  lineNumber: string,
): Promise<BusRoute[]> {
  log('looking up routes', { operatorId, lineNumber })
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
  log('fetched routes', routes.length)
  return routes
}

export async function getStopsForRouteAsync(
  routeIds: number[],
  timestamp: Moment,
): Promise<BusStop[]> {
  log('looking up stops', routeIds)
  const stops: BusStop[] = []

  for (const routeId of routeIds) {
    // eslint-disable-next-line no-debugger
    debugger
    const rides = await GTFS_API.gtfsRidesListGet({
      gtfsRouteId: routeId,
      startTimeFrom: moment(timestamp).subtract(1, 'days').second(0).milliseconds(0).toDate(),
      startTimeTo: moment(timestamp).add(1, 'days').second(0).milliseconds(0).toDate(),
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
    await Promise.all(
      rideStops.map(async (rideStop) => {
        const stop = await GTFS_API.gtfsStopsGetGet({ id: rideStop.gtfsStopId })
        stops.push(fromGtfsStop(rideStop, stop, rideRepresentative))
      }),
    )
  }
  log('fetched stops', stops.length)
  return stops.sort((a, b) =>
    a.stopSequence === b.stopSequence
      ? a.name.localeCompare(b.name)
      : a.stopSequence - b.stopSequence,
  )
}

export async function getGtfsStopHitTimesAsync(stop: BusStop, timestamp: Moment) {
  const targetStartTime = moment(timestamp).subtract(stop.minutesFromRouteStartTime, 'minutes')
  log('looking for rides starting around time', {
    stopId: stop.stopId,
    min: stop.minutesFromRouteStartTime,
    targetStartTime: targetStartTime.toDate(),
  })

  const rides = await GTFS_API.gtfsRidesListGet({
    gtfsRouteId: stop.routeId,
    startTimeFrom: moment(targetStartTime)
      .subtract(SEARCH_MARGIN_HOURS, 'hours')
      .second(0)
      .milliseconds(0)
      .toDate(),
    startTimeTo: moment(targetStartTime)
      .add(SEARCH_MARGIN_HOURS, 'hours')
      .second(0)
      .milliseconds(0)
      .toDate(),
    limit: 1024,
    orderBy: 'start_time asc',
  })

  if (rides.length === 0) {
    return []
  }

  const diffFromTargetStart = (ride: GtfsRideWithRelatedPydanticModel): number =>
    Math.abs(timestamp.diff(ride.startTime, 'seconds'))

  const closestInTimeRides = rides
    .sort((a, b) => diffFromTargetStart(a) - diffFromTargetStart(b))
    .slice(0, MAX_HITS_COUNT)

  const rideIds = closestInTimeRides.map((ride) => ride.id).join(JOIN_SEPARATOR)
  const stopHits = await GTFS_API.gtfsRideStopsListGet({
    gtfsRideIds: rideIds,
    gtfsStopIds: stop.stopId.toString(),
  })
  return stopHits.sort((hit1, hit2) => +hit1.arrivalTime! - +hit2.arrivalTime!)
}

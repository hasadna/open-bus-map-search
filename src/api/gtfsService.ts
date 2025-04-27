import axios from 'axios'
import {
  GtfsApi,
  GtfsRideStopPydanticModel,
  GtfsRideWithRelatedPydanticModel,
} from 'open-bus-stride-client'
import moment, { Moment } from 'moment'
import { BusRoute, fromGtfsRoute } from 'src/model/busRoute'
import { BusStop, fromGtfsStop } from 'src/model/busStop'
import { API_CONFIG, MAX_HITS_COUNT, BASE_PATH } from 'src/api/apiConfig'
// import { Route } from 'react-router'

const GTFS_API = new GtfsApi(API_CONFIG)
//const USER_CASES_API = new UserCasesApi(API_CONFIG)
const JOIN_SEPARATOR = ','
const SEARCH_MARGIN_HOURS = 4

type StopHitsPayLoadType = {
  gtfsRideIds: string
  gtfsStopIds: string
  arrival_time_to: number
  arrival_time_from: number
}

export async function getRoutesAsync(
  fromTimestamp: moment.Moment,
  toTimestamp: moment.Moment,
  operatorId?: string,
  lineNumber?: string,
  signal?: AbortSignal,
): Promise<BusRoute[]> {
  const gtfsRoutes = await GTFS_API.gtfsRoutesListGet(
    {
      routeShortName: lineNumber,
      operatorRefs: operatorId,
      dateFrom: fromTimestamp.startOf('day').toDate(),
      dateTo: moment.min(toTimestamp.endOf('day'), moment()).toDate(),
      limit: 100,
    },
    { signal },
  )
  const routes = Object.values(
    gtfsRoutes
      .filter(
        (route) =>
          route.date.getDate() >= fromTimestamp.date() &&
          route.date.getDate() <= toTimestamp.date(),
      )
      .map((route) => fromGtfsRoute(route))
      .reduce(
        (agg, line) => {
          const groupByKey = line.key
          const prevLine = agg[groupByKey] || { routeIds: [] }
          agg[groupByKey] = {
            ...line,
            ...prevLine,
            routeIds: [...prevLine.routeIds, ...line.routeIds],
          }
          return agg
        },
        {} as Record<string, BusRoute>,
      ),
  )
  return routes
}

export async function getStopsForRouteAsync(
  routeIds: number[],
  timestamp: Moment,
): Promise<BusStop[]> {
  const stops: BusStop[] = []

  for (const routeId of routeIds) {
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
        if (!rideStop.gtfsStopId) return
        const stop = await GTFS_API.gtfsStopsGetGet({ id: rideStop.gtfsStopId })
        stops.push(fromGtfsStop(rideStop as GtfsRideStopPydanticModel, stop, rideRepresentative))
      }),
    )
  }
  return stops.sort((a, b) =>
    a.stopSequence === b.stopSequence
      ? a.name.localeCompare(b.name)
      : a.stopSequence - b.stopSequence,
  )
}

export async function getGtfsStopHitTimesAsync(stop: BusStop, timestamp: Moment) {
  const targetStartTime = moment(timestamp).subtract(stop.minutesFromRouteStartTime, 'minutes')

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

  const minStartTime = Math.min(...rides.map((ride) => Number(ride.startTime)))
  const maxEndTime = Math.max(...rides.map((ride) => Number(ride.endTime)))

  /* Fix StopHits bugs next steps TODO:
  1. Add a test to ensure this feature is working correctly.
  2. Optimize the axios request to minimize latency. - Currently takes forever.
  3. Fix any on this- define the hit type
  */

  try {
    const stopHitsRequestPayLoad: StopHitsPayLoadType = {
      gtfsRideIds: rideIds,
      gtfsStopIds: stop.stopId.toString(),
      arrival_time_from: minStartTime,
      arrival_time_to: maxEndTime,
    }

    const stopHitsRes = await axios.get(`${BASE_PATH}/gtfs_ride_stops/list`, {
      params: stopHitsRequestPayLoad,
    })

    if (stopHitsRes.status !== 200) {
      throw new Error(`Error fetching stop hits: ${stopHitsRes.statusText}`)
    }

    if (stopHitsRes.data.length === 0) {
      throw new Error(`No stop hits found`)
    }

    const stopHits: GtfsRideStopPydanticModel[] = stopHitsRes.data

    return stopHits.sort((hit1, hit2) => +hit1.arrivalTime! - +hit2.arrivalTime!)
  } catch (error) {
    console.error(`Error fetching stop hits:`, error)
    return []
  }
}

export async function getAllRoutesList(operatorId: string, date: Date, signal?: AbortSignal) {
  return await GTFS_API.gtfsRoutesListGet(
    {
      operatorRefs: operatorId,
      dateFrom: date,
      dateTo: date,
      orderBy: 'route_long_name asc',
      limit: -1,
    },
    { signal },
  )
}

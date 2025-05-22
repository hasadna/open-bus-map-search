import axios from 'axios'
import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import {
  GtfsApi,
  GtfsRideStopPydanticModel,
  GtfsRideWithRelatedPydanticModel,
} from 'open-bus-stride-client'
import { API_CONFIG, BASE_PATH, MAX_HITS_COUNT } from 'src/api/apiConfig'
import { BusRoute, fromGtfsRoute } from 'src/model/busRoute'
import { BusStop, fromGtfsStop } from 'src/model/busStop'
// import { Route } from 'react-router'

dayjs.extend(minMax)

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
  fromTimestamp: dayjs.Dayjs,
  toTimestamp: dayjs.Dayjs,
  operatorId?: string,
  lineNumber?: string,
  signal?: AbortSignal,
): Promise<BusRoute[]> {
  const gtfsRoutes = await GTFS_API.gtfsRoutesListGet(
    {
      routeShortName: lineNumber,
      operatorRefs: operatorId,
      dateFrom: fromTimestamp.startOf('day').toDate(),
      dateTo: dayjs.min(toTimestamp.endOf('day'), dayjs()).toDate(),
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
  timestamp: dayjs.Dayjs,
): Promise<BusStop[]> {
  const stops: BusStop[] = []

  for (const routeId of routeIds) {
    const rides = await GTFS_API.gtfsRidesListGet({
      gtfsRouteId: routeId,
      startTimeFrom: timestamp.subtract(1, 'day').second(0).millisecond(0).toDate(),
      startTimeTo: timestamp.add(1, 'day').second(0).millisecond(0).toDate(),
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

export async function getGtfsStopHitTimesAsync(stop: BusStop, timestamp: dayjs.Dayjs) {
  const targetStartTime = timestamp.subtract(stop.minutesFromRouteStartTime, 'minute')

  const rides = await GTFS_API.gtfsRidesListGet({
    gtfsRouteId: stop.routeId,
    startTimeFrom: targetStartTime
      .subtract(SEARCH_MARGIN_HOURS, 'hour')
      .second(0)
      .millisecond(0)
      .toDate(),
    startTimeTo: targetStartTime.add(SEARCH_MARGIN_HOURS, 'hour').second(0).millisecond(0).toDate(),
    limit: 1024,
    orderBy: 'start_time asc',
  })

  if (rides.length === 0) {
    return []
  }

  const diffFromTargetStart = (ride: GtfsRideWithRelatedPydanticModel): number =>
    Math.abs(timestamp.diff(ride.startTime, 'second'))

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

export async function getRouteById(routeId?: string, signal?: AbortSignal) {
  try {
    if (!routeId?.trim()) {
      throw new Error('Route id is required and cannot be empty')
    }
    const id = Number(routeId)
    if (!Number.isInteger(id) || id <= 0 || id > Number.MAX_SAFE_INTEGER) {
      throw new Error(`Invalid route id: ${routeId}.`)
    }
    return await GTFS_API.gtfsRoutesGetGet({ id }, { signal })
  } catch (error) {
    let errorMessage: string
    if (error instanceof Error) {
      errorMessage =
        error.message === 'Response returned an error code'
          ? `Route with id ${routeId} not found`
          : error.message
    } else {
      errorMessage = 'An unexpected error occurred while fetching route data'
    }
    console.error(`Failed to get route ${routeId}:`, errorMessage)
    throw new Error(errorMessage)
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

export async function getRoutesByLineRef(
  operatorId: string,
  lineRefs: string,
  date: Date,
  signal?: AbortSignal,
) {
  return await GTFS_API.gtfsRoutesListGet(
    {
      operatorRefs: operatorId,
      dateFrom: date,
      dateTo: date,
      lineRefs,
      limit: 1,
    },
    { signal },
  )
}

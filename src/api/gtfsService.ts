import axios from 'axios'
import {
  GtfsRideStopPydanticModel,
  GtfsRideWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
} from '@hasadna/open-bus-api-client'
import dayjs from 'src/dayjs'
import { GTFS_API, MAX_HITS_COUNT, STRIDE_API_BASE_PATH } from 'src/api/apiConfig'
import { BusRoute, fromGtfsRoute } from 'src/model/busRoute'
import { BusStop, fromGtfsStop } from 'src/model/busStop'

const JOIN_SEPARATOR = ','
const SEARCH_MARGIN_HOURS = 4

type StopHitsPayLoadType = {
  gtfsRideIds: string
  gtfsStopIds: string
  arrival_time_to: number
  arrival_time_from: number
}

type GetGTFSRoutesParams = {
  from?: number
  to?: number
  operatorId?: string
  lineRefs?: string
  routeShortName?: string
  limit?: number
  signal?: AbortSignal
  toBusRoute?: false
}

type GetGTFSRoutesParamsBusRoute = Omit<GetGTFSRoutesParams, 'toBusRoute'> & { toBusRoute: true }

export async function getGtfsRoutes(params: GetGTFSRoutesParams): Promise<GtfsRoutePydanticModel[]>
export async function getGtfsRoutes(params: GetGTFSRoutesParamsBusRoute): Promise<BusRoute[]>
export async function getGtfsRoutes({
  from,
  to,
  operatorId,
  lineRefs,
  routeShortName,
  limit = 100,
  signal,
  toBusRoute,
}: GetGTFSRoutesParams | GetGTFSRoutesParamsBusRoute): Promise<
  GtfsRoutePydanticModel[] | BusRoute[]
> {
  const dateFrom = dayjs(from).startOf('day').toDate()
  const dateTo = dayjs.min(dayjs(to || from).endOf('day'), dayjs()).toDate()
  const routes = await GTFS_API.gtfsRoutesListGet(
    {
      dateFrom,
      dateTo,
      operatorRefs: operatorId,
      lineRefs,
      routeShortName,
      limit,
    },
    { signal },
  )
  if (toBusRoute) return routes.map(fromGtfsRoute)
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

    const stopHitsRes = await axios.get(`${STRIDE_API_BASE_PATH}/gtfs_ride_stops/list`, {
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

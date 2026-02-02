import { GTFS_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import { BusRoute, fromGtfsRoute } from 'src/model/busRoute'
import { BusStop, fromGtfsStop } from 'src/model/busStop'

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
        if (
          !rideStop.gtfsStopId ||
          stops.find((b) => b.code === rideStop.gtfsStopCode?.toString())
        ) {
          return
        }
        const stop = await GTFS_API.gtfsStopsGetGet({ id: rideStop.gtfsStopId })
        stops.push(fromGtfsStop(rideStop, stop, rideRepresentative))
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
  try {
    const start = timestamp.subtract(4, 'hour').toDate()
    const end = timestamp.add(4, 'hour').toDate()

    const rides = await GTFS_API.gtfsRidesListGet({
      gtfsRouteId: stop.routeId,
      startTimeFrom: start,
      startTimeTo: end,
      orderBy: 'start_time asc',
    })

    if (rides.length === 0) return []

    const rideIds = rides.map((ride) => ride.id).join(',')

    return await GTFS_API.gtfsRideStopsListGet({
      gtfsRideIds: rideIds,
      gtfsStopIds: stop.stopId.toString(),
      arrivalTimeFrom: start,
      arrivalTimeTo: end,
      orderBy: 'arrival_time asc',
    })
  } catch (error) {
    console.error(`Error fetching stop hits for stop ${stop.stopId}:`, error)
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

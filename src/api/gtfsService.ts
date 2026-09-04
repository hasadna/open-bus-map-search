import { GTFS_API } from 'src/api/apiConfig'
import dayjs, { utcNoonForDateStr } from 'src/dayjs'
import { BusRoute, fromGtfsRoute } from 'src/model/busRoute'
import { BusStop, fromGtfsStop } from 'src/model/busStop'

/** GTFS routes running between two calendar dates ("YYYY-MM-DD", Israel time, both
 *  inclusive), merged by route key so a line's variants collapse into one entry
 *  carrying all its routeIds. Pass the same date twice for a single day. */
export async function getRoutesAsync(
  fromDate: string,
  toDate: string,
  operatorId?: string,
  lineNumber?: string,
  signal?: AbortSignal,
): Promise<BusRoute[]> {
  const gtfsRoutes = await GTFS_API.gtfsRoutesListGet(
    {
      routeShortName: lineNumber,
      operatorRefs: operatorId,
      dateFrom: utcNoonForDateStr(fromDate),
      dateTo: utcNoonForDateStr(toDate),
      limit: 15000,
    },
    { signal },
  )
  const routes = Object.values(
    gtfsRoutes
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
  time: dayjs.Dayjs,
): Promise<BusStop[]> {
  const stops: BusStop[] = []

  for (const routeId of routeIds) {
    const rides = await GTFS_API.gtfsRidesListGet({
      gtfsRouteId: routeId,
      startTimeFrom: time.subtract(1, 'day').second(0).millisecond(0).toDate(),
      startTimeTo: time.add(1, 'day').second(0).millisecond(0).toDate(),
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

export async function getGtfsStopHitTimesAsync(stop: BusStop, time: dayjs.Dayjs) {
  try {
    return await GTFS_API.gtfsRideStopsListGet({
      gtfsRideGtfsRouteId: stop.routeId,
      gtfsStopIds: stop.stopId.toString(),
      arrivalTimeFrom: time.subtract(4, 'hour').toDate(),
      arrivalTimeTo: time.add(4, 'hour').toDate(),
      orderBy: 'arrival_time asc',
    })
  } catch (error) {
    console.error(`Error fetching stop hits for stop ${stop.stopId}:`, error)
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
      limit: 15000,
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

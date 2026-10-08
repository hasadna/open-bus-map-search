import type {
  GtfsAgencyPydanticModel,
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRideWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { GTFS_API } from 'src/api/apiConfig'
import dayjs, { israelDayBounds } from 'src/dayjs'
import { addDays, civilDateToApiDate, toCivilDate } from 'src/model/time/civilDate'

const STALE_TIME = 5 * 60 * 1000
const GC_TIME = 10 * 60 * 1000
const MAX_RESULTS = 15000

export async function fetchAllPages<T>(
  fetchPage: (offset: number, limit: number) => Promise<T[]>,
  pageSize = MAX_RESULTS,
) {
  const rows: T[] = []
  let offset = 0

  while (true) {
    const page = await fetchPage(offset, pageSize)
    rows.push(...page)
    if (page.length < pageSize) return rows
    offset += pageSize
  }
}

export function deduplicateStopsByCode(stops: GtfsRideStopWithRelatedPydanticModel[]) {
  const unique = new Map<number, GtfsRideStopWithRelatedPydanticModel>()
  for (const stop of stops) {
    if (stop.gtfsStopCode !== undefined && !unique.has(stop.gtfsStopCode)) {
      unique.set(stop.gtfsStopCode, stop)
    }
  }
  return [...unique.values()]
}

export async function fetchStopsForRouteVariants(
  listRides: (offset: number, limit: number) => Promise<GtfsRideWithRelatedPydanticModel[]>,
  listRideStops: (
    rideIds: number[],
    offset: number,
    limit: number,
  ) => Promise<GtfsRideStopWithRelatedPydanticModel[]>,
  pageSize = MAX_RESULTS,
  rideIdBatchSize = 100,
) {
  const rides = await fetchAllPages(listRides, pageSize)
  const rideIds = rides.flatMap((ride) => (ride.id === undefined ? [] : [ride.id]))
  const stops: GtfsRideStopWithRelatedPydanticModel[] = []

  for (let start = 0; start < rideIds.length; start += rideIdBatchSize) {
    const rideIdBatch = rideIds.slice(start, start + rideIdBatchSize)
    stops.push(
      ...(await fetchAllPages(
        (offset, limit) => listRideStops(rideIdBatch, offset, limit),
        pageSize,
      )),
    )
  }

  return deduplicateStopsByCode(stops)
}

export const useBusOperatorQuery = (eventDate?: dayjs.Dayjs) => {
  const date = eventDate ? toCivilDate(eventDate) : null
  return useQuery<GtfsAgencyPydanticModel[]>({
    queryKey: ['complaint', 'agencies', date],
    queryFn: async () => {
      if (!date) return []
      const rows = await GTFS_API.gtfsAgenciesListGet({
        dateFrom: civilDateToApiDate(date),
        dateTo: civilDateToApiDate(date),
        limit: MAX_RESULTS,
      })
      if (rows.length) return rows
      const fallbackDate = addDays(date, -7)
      return GTFS_API.gtfsAgenciesListGet({
        dateFrom: civilDateToApiDate(fallbackDate),
        dateTo: civilDateToApiDate(date),
        limit: MAX_RESULTS,
      })
    },
    enabled: !!date,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useLinesQuery = (eventDate?: dayjs.Dayjs, operator?: number, lineNumber?: string) => {
  const date = eventDate ? toCivilDate(eventDate) : null
  return useQuery<GtfsRoutePydanticModel[]>({
    queryKey: ['complaint', 'routes', date, operator, lineNumber],
    queryFn: async () => {
      if (!date || operator === undefined || !lineNumber) return []
      return GTFS_API.gtfsRoutesListGet({
        dateFrom: civilDateToApiDate(date),
        dateTo: civilDateToApiDate(date),
        operatorRefs: String(operator),
        routeShortName: lineNumber,
        limit: MAX_RESULTS,
        orderBy: 'route_direction asc',
      })
    },
    enabled: !!date && operator !== undefined && !!lineNumber,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export const useBoardingStationQuery = (route?: GtfsRoutePydanticModel) => {
  const date = route?.date ? toCivilDate(route.date) : null
  const queryKey = useMemo(
    () => ['complaint', 'stations', date, route?.id] as const,
    [date, route?.id],
  )
  return useQuery<GtfsRideStopWithRelatedPydanticModel[]>({
    queryKey,
    queryFn: async () => {
      if (!route) return []
      return fetchBoardingStations(route)
    },
    enabled: !!date && route?.id !== undefined,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}

export async function fetchBoardingStations(route: GtfsRoutePydanticModel) {
  const date = route.date ? toCivilDate(route.date) : null
  if (!date || route.id === undefined) return []

  const loadStops = (routeId: number, serviceDate: typeof date) => {
    const routeDate = civilDateToApiDate(serviceDate)
    // Rides on this service date can stop after midnight on the following day.
    const arrivalTimeFrom = israelDayBounds(serviceDate).start.toDate()
    const arrivalTimeTo = israelDayBounds(addDays(serviceDate, 2)).start.toDate()
    return fetchStopsForRouteVariants(
      (offset, limit) =>
        GTFS_API.gtfsRidesListGet({
          gtfsRouteId: routeId,
          gtfsRouteDateFrom: routeDate,
          gtfsRouteDateTo: routeDate,
          limit,
          offset,
          orderBy: 'start_time asc',
        }),
      (rideIds, offset, limit) =>
        GTFS_API.gtfsRideStopsListGet({
          gtfsRideIds: rideIds.join(','),
          arrivalTimeFrom,
          arrivalTimeTo,
          limit,
          offset,
          orderBy: 'stop_sequence asc',
        }),
    )
  }

  const stops = await loadStops(route.id, date)
  if (stops.length || route.lineRef === undefined || route.operatorRef === undefined) return stops

  // A new GTFS date can contain rides before their stop times have been imported.
  const previousRoutes = await GTFS_API.gtfsRoutesListGet({
    dateFrom: civilDateToApiDate(addDays(date, -7)),
    dateTo: civilDateToApiDate(addDays(date, -1)),
    lineRefs: String(route.lineRef),
    operatorRefs: String(route.operatorRef),
    routeShortName: route.routeShortName,
    routeMkt: route.routeMkt,
    routeDirection: route.routeDirection,
    routeAlternative: route.routeAlternative,
    limit: 100,
    orderBy: 'date desc',
  })

  for (const previousRoute of previousRoutes) {
    const previousDate = previousRoute.date ? toCivilDate(previousRoute.date) : null
    if (previousRoute.id === undefined || !previousDate) continue
    const previousStops = await loadStops(previousRoute.id, previousDate)
    if (previousStops.length) return previousStops
  }
  return []
}

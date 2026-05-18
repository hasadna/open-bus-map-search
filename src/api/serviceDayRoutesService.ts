import {
  GtfsRideWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
} from '@hasadna/open-bus-api-client'
import { GTFS_API } from 'src/api/apiConfig'
import dayjs, { toIsraelTimezone } from 'src/dayjs'
import { BusRoute, fromGtfsRoute } from 'src/model/busRoute'

/**
 * Returns a Date at noon UTC for the given YYYY-MM-DD string so that
 * .toISOString().substring(0, 10) always yields the correct date string
 * regardless of local timezone offsets.
 */
function utcNoonForDateStr(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`)
}

function rideToRoute(ride: GtfsRideWithRelatedPydanticModel): GtfsRoutePydanticModel | null {
  if (
    ride.gtfsRouteId == null ||
    ride.gtfsRouteDate == null ||
    ride.gtfsRouteLineRef == null ||
    ride.gtfsRouteOperatorRef == null
  ) {
    return null
  }
  return {
    id: ride.gtfsRouteId,
    date: ride.gtfsRouteDate,
    lineRef: ride.gtfsRouteLineRef,
    operatorRef: ride.gtfsRouteOperatorRef,
    routeShortName: ride.gtfsRouteRouteShortName,
    routeLongName: ride.gtfsRouteRouteLongName,
    routeMkt: ride.gtfsRouteRouteMkt,
    routeDirection: ride.gtfsRouteRouteDirection,
    routeAlternative: ride.gtfsRouteRouteAlternative,
    agencyName: ride.gtfsRouteAgencyName,
    routeType: ride.gtfsRouteRouteType,
  }
}

/**
 * Returns all routes for the given service day:
 * - All GTFS routes whose date equals serviceDate (Israel timezone)
 * - Tomorrow's routes that have at least one planned ride starting between
 *   midnight and 04:00 Israel time (late-night service belonging to this day),
 *   derived directly from the rides response without a separate routes fetch.
 *
 * Routes with the same key are merged (routeIds accumulated).
 */
export async function getServiceDayRoutes(
  serviceDate: dayjs.Dayjs,
  operatorId?: string,
  lineNumber?: string,
  signal?: AbortSignal,
): Promise<BusRoute[]> {
  const todayIL = toIsraelTimezone(serviceDate).startOf('day')
  const tomorrowIL = todayIL.add(1, 'day')

  const todayUTC = utcNoonForDateStr(todayIL.format('YYYY-MM-DD'))
  const tomorrowUTC = utcNoonForDateStr(tomorrowIL.format('YYYY-MM-DD'))
  const tomorrowMidnightUTC = tomorrowIL.toDate()
  const tomorrow04hUTC = tomorrowIL.add(4, 'hours').toDate()

  const [todayRaw, ridesInWindow] = await Promise.all([
    // Today's routes
    GTFS_API.gtfsRoutesListGet(
      {
        ...(operatorId && { operatorRefs: operatorId }),
        ...(lineNumber && { routeShortName: lineNumber }),
        dateFrom: todayUTC,
        dateTo: todayUTC,
        limit: 15000,
      },
      { signal },
    ),
    // Late-night rides: tomorrow's routes, starting between midnight and 04:00 Israel time.
    // The ride response embeds all route fields, so no separate routes fetch is needed.
    GTFS_API.gtfsRidesListGet(
      {
        ...(operatorId && { gtfsRouteOperatorRefs: operatorId }),
        ...(lineNumber && { gtfsRouteRouteShortName: lineNumber }),
        gtfsRouteDateFrom: tomorrowUTC,
        gtfsRouteDateTo: tomorrowUTC,
        startTimeFrom: tomorrowMidnightUTC,
        startTimeTo: tomorrow04hUTC,
        limit: 15000,
      },
      { signal },
    ),
  ])

  // Deduplicate by gtfsRouteId and extract route objects from the embedded ride data
  const lateNightRoutes = Array.from(
    ridesInWindow
      .reduce((map, ride) => {
        if (ride.gtfsRouteId != null && !map.has(ride.gtfsRouteId)) {
          const route = rideToRoute(ride)
          if (route) map.set(ride.gtfsRouteId, route)
        }
        return map
      }, new Map<number, GtfsRoutePydanticModel>())
      .values(),
  )

  return Object.values(
    [...todayRaw, ...lateNightRoutes].map(fromGtfsRoute).reduce(
      (agg, route) => {
        const prev = agg[route.key] || { routeIds: [] as number[] }
        agg[route.key] = { ...route, ...prev, routeIds: [...prev.routeIds, ...route.routeIds] }
        return agg
      },
      {} as Record<string, BusRoute>,
    ),
  )
}

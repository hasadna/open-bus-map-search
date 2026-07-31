import { SiriRideWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import dayjs, { toIsraelTimezone } from 'src/dayjs'
import { BusRoute } from 'src/model/busRoute'
import {
  formatServiceDayTime,
  formatStartTimeForQuery,
  serviceDayTokenToDisplay,
} from 'src/pages/components/utils/startTimeUtils'

/** A GTFS route resolved for the vehicle page — a BusRoute plus the agency name
 *  (the latter is not part of the shared BusRoute model). */
export type ResolvedRoute = BusRoute & { agencyName?: string }

export type VehicleRideRow = {
  id: number
  operator: string
  lineNumber: string
  origin: string
  destination: string
  lineRef?: number
  displayTime: string
  /** Present only when the ride can be fully reconstructed for single-line-map. */
  href?: string
  /** GlobalSearchContext patch applied on row click — present iff `href` is. */
  setSearchPayload?: {
    operatorId: string
    lineNumber: string
    routeKey: string
    rideTime: string
  }
}

/**
 * Map a vehicle's SIRI rides into display rows for the vehicle page table.
 *
 * SIRI rides carry only `siri_route__line_ref`; the human-readable line number and
 * route names (gtfs_route__*) are frequently null on the ride. They are resolved
 * from `routeByLineRef` — the operator's GTFS routes for the service day, keyed by
 * line ref. A ride is linkable to single-line-map only when its route identity
 * (operator + line + GTFS route key) and departure token can be fully reconstructed.
 *
 * Pure: no React, no fetching — every input is passed in so the mapping can be
 * unit-tested directly.
 */
export function buildVehicleRideRows({
  rides,
  routeByLineRef,
  serviceDayStart,
  date,
}: {
  rides: SiriRideWithRelatedPydanticModel[] | undefined
  routeByLineRef: Map<string, ResolvedRoute> | undefined
  serviceDayStart: dayjs.Dayjs
  date: string
}): VehicleRideRow[] {
  return (rides ?? [])
    .filter((ride): ride is SiriRideWithRelatedPydanticModel & { id: number } => !!ride.id)
    .map((ride) => {
      // The ride's own gtfs_route fields are frequently null; resolve the route from
      // the operator's GTFS routes via line ref (BusRoute carries the line number,
      // origin/destination names, operator and route key — same model the rest of
      // the app uses).
      const lineRef = ride.siriRouteLineRef ?? ride.gtfsRouteLineRef
      const route = lineRef != null ? routeByLineRef?.get(String(lineRef)) : undefined
      const operatorId = route?.operatorId ?? ride.siriRouteOperatorRef?.toString()
      const lineNumber = route?.lineNumber
      const token = ride.scheduledStartTime
        ? formatServiceDayTime(toIsraelTimezone(ride.scheduledStartTime), serviceDayStart)
        : undefined
      const { time, nextDay } = token
        ? serviceDayTokenToDisplay(token)
        : { time: '—', nextDay: false }

      // A ride is linkable to single-line-map only if we can fully reconstruct its
      // route identity (operator + line + GTFS route key) and departure token.
      const canLink = !!(operatorId && lineNumber && route?.key && token)
      const rideTime = token ? formatStartTimeForQuery(token) : ''
      const setSearchPayload =
        canLink && route?.key && operatorId && lineNumber
          ? { operatorId, lineNumber, routeKey: route.key, rideTime }
          : undefined
      const href = setSearchPayload
        ? `/single-line-map?${new URLSearchParams({
            date,
            operatorId: setSearchPayload.operatorId,
            lineNumber: setSearchPayload.lineNumber,
            routeKey: setSearchPayload.routeKey,
            rideTime: setSearchPayload.rideTime,
          }).toString()}`
        : undefined

      return {
        id: ride.id,
        operator: route?.agencyName ?? operatorId ?? '—',
        lineNumber: lineNumber ?? '—',
        origin: route?.fromName || '—',
        destination: route?.toName || '—',
        lineRef: route?.lineRef,
        displayTime: nextDay ? `🌙 ${time}` : time,
        href,
        setSearchPayload,
      }
    })
}

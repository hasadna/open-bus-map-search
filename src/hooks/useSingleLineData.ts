import { useQuery } from '@tanstack/react-query'
import { uniqBy } from 'es-toolkit/compat'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SIRI_API } from 'src/api/apiConfig'
import { getRoutesByLineRef, getStopsForRouteAsync } from 'src/api/gtfsService'
import { getServiceDayRoutes } from 'src/api/serviceDayRoutesService'
import { getServiceDayTimeBounds, toIsraelTimezone } from 'src/dayjs'
import { BusRoute } from 'src/model/busRoute'
import {
  type PositionGroup,
  ROUTE_COLORS,
  toPoint,
} from 'src/pages/components/map-related/map-types'
import { routeStartEnd, vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'
import {
  formatServiceDayTime,
  normalizeStartTimeToken,
  parseStartTimeToken,
  serviceDayTokenToDisplay,
} from 'src/pages/components/utils/startTimeUtils'

interface UseSingleLineDataOptions {
  operatorId?: string
  lineNumber?: string
  date: string
  routeKey?: string | null
  rideTime?: string | null
  onRouteKeyChange?: (routeKey: string | null) => void
  onRideTimeChange?: (rideTime: string | null) => void
}

export const useSingleLineData = ({
  operatorId,
  lineNumber,
  date,
  routeKey,
  rideTime,
  onRouteKeyChange,
  onRideTimeChange,
}: UseSingleLineDataOptions) => {
  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const [rideIdsByToken, setRideIdsByToken] = useState<Map<string, number[]>>(new Map())
  const [vehicleRefById, setVehicleRefById] = useState<Map<number, string>>(new Map())
  const [positionGroups, setPositionGroups] = useState<PositionGroup[]>([])
  const [locationsAreLoading, setLocationsAreLoading] = useState(false)
  const [error, setError] = useState<string>()
  const startTime = useMemo(() => normalizeStartTimeToken(rideTime ?? undefined), [rideTime])

  const setStartTime = useCallback(
    (startTime?: string) => {
      onRideTimeChange?.(normalizeStartTimeToken(startTime) ?? null)
    },
    [onRideTimeChange],
  )

  const setRouteKey = useCallback(
    (key?: string) => {
      onRouteKeyChange?.(key ?? null)
    },
    [onRouteKeyChange],
  )

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      setRoutes(undefined)
      setError(undefined)
      onRouteKeyChange?.(null)
      onRideTimeChange?.(null)
      return
    }

    const controller = new AbortController()

    // Service-day aware: includes the next calendar day's late-night routes
    // (00:00–04:00) that belong to this service day, matching the gaps page.
    getServiceDayRoutes(date, operatorId, lineNumber, controller.signal)
      .then((routes) => {
        setRoutes(routes)
        setError(undefined)
      })
      .catch((err: unknown) => {
        if ((err as { cause?: { name?: string } })?.cause?.name !== 'AbortError') {
          setRoutes(undefined)
          onRouteKeyChange?.(null)
          setError(err instanceof Error ? err.message : 'Failed to fetch routes')
        }
      })

    return () => {
      controller.abort()
    }
  }, [operatorId, lineNumber, date, onRouteKeyChange, onRideTimeChange])

  const selectedRoute = useMemo(() => {
    return routes?.find((route) => route.key === (routeKey ?? undefined))
  }, [routes, routeKey])

  const [serviceDayStart, serviceDayEnd] = useMemo(() => {
    const { start, end } = getServiceDayTimeBounds(date)
    return [start, end]
  }, [date])

  const parsedStartTime = useMemo(() => parseStartTimeToken(startTime), [startTime])

  const selectedRideIdsKey = useMemo(
    () => (startTime ? (rideIdsByToken.get(startTime) ?? []).join(',') : ''),
    [startTime, rideIdsByToken],
  )

  // Fetch departure list for the dropdown, grouping double trips into one entry
  useEffect(() => {
    // Clear the previous day's ride mapping synchronously (before the async
    // refetch) so the pings effect below can't fire with stale, other-date
    // siri_ride ids while a ride-time token is still selected across a date change.
    setOptions([])
    setRideIdsByToken(new Map())
    setVehicleRefById(new Map())
    if (!selectedRoute?.lineRef) {
      return
    }
    const controller = new AbortController()
    SIRI_API.siriRidesListGet(
      {
        siriRouteLineRefs: selectedRoute?.lineRef?.toString(),
        siriRouteOperatorRefs: operatorId,
        scheduledStartTimeFrom: serviceDayStart.toDate(),
        scheduledStartTimeTo: serviceDayEnd.toDate(),
        orderBy: 'scheduled_start_time asc',
        limit: 500,
      },
      { signal: controller.signal },
    )
      .then((rides) => {
        const byTime = new Map<
          string,
          { id: number; vehicleRef: string; ride: (typeof rides)[0] }[]
        >()
        for (const ride of rides) {
          if (!ride.scheduledStartTime || !ride.vehicleRef || !ride.id) continue
          const key = formatServiceDayTime(
            toIsraelTimezone(ride.scheduledStartTime),
            serviceDayStart,
          )
          if (!byTime.has(key)) byTime.set(key, [])
          byTime.get(key)!.push({ id: ride.id, vehicleRef: ride.vehicleRef, ride })
        }

        const idMap = new Map<string, number[]>()
        const vehMap = new Map<number, string>()
        const opts: { value: string; label: string }[] = []

        byTime.forEach((group, key) => {
          idMap.set(
            key,
            group.map((g) => g.id),
          )
          group.forEach((g) => vehMap.set(g.id, g.vehicleRef))
          // Show the wall-clock time (00:10), not the extended-hour token (24:10),
          // and flag past-midnight departures with a moon so the next-night rides
          // are obvious. The extended token stays the option `value` for the URL.
          const { time: displayTime, nextDay } = serviceDayTokenToDisplay(key)
          const scheduledTime = nextDay ? `🌙 ${displayTime}` : displayTime
          const routeLongName = group[0].ride.gtfsRouteRouteLongName
          const [start, end] = routeLongName ? routeStartEnd(routeLongName) : []
          const routePart = routeLongName
            ? `${group[0].ride.gtfsRouteRouteShortName} - ${start} ⇄ ${end}`
            : undefined
          const label =
            group.length === 1
              ? routePart
                ? `${scheduledTime} (${routePart})`
                : scheduledTime
              : routePart
                ? `${scheduledTime} (${routePart}, ${group.length} vehicles)`
                : `${scheduledTime} (${group.length} vehicles)`
          opts.push({ value: key, label })
        })

        setOptions(opts)
        setRideIdsByToken(idMap)
        setVehicleRefById(vehMap)
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') console.error(err)
      })
    return () => controller.abort()
  }, [selectedRoute?.lineRef, operatorId, serviceDayStart, serviceDayEnd])

  // Fetch location pings for the selected ride(s), one group per vehicle
  useEffect(() => {
    const rideIds = selectedRideIdsKey ? selectedRideIdsKey.split(',').map(Number) : []
    if (!rideIds.length) {
      setPositionGroups([])
      return
    }
    setLocationsAreLoading(true)
    Promise.all(
      rideIds.map((rideId, idx) =>
        SIRI_API.siriVehicleLocationsListGet({
          siriRidesIds: rideId.toString(),
          // Israel bounding box — drops null/zero-coordinate and stray pings at the API level
          latGreaterOrEqual: 29.0,
          latLowerOrEqual: 33.5,
          lonGreaterOrEqual: 34.0,
          lonLowerOrEqual: 36.3,
          orderBy: 'recorded_at_time asc',
          limit: 10000,
          getCount: false,
        }).then((data) => ({
          color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
          label: vehicleIDFormat(vehicleRefById.get(rideId)) ?? String(idx + 1),
          vehicleRef: vehicleRefById.get(rideId),
          positions: uniqBy(data, (l) => l.id).map(toPoint),
        })),
      ),
    )
      .then(setPositionGroups)
      .catch(console.error)
      .finally(() => setLocationsAreLoading(false))
  }, [selectedRideIdsKey, vehicleRefById])

  // Fetch planned stops for the black polyline
  const stopsQuery = useQuery({
    queryFn: async () => {
      const scheduledTime = parsedStartTime?.scheduledTime
      const scheduledLine = parsedStartTime?.lineRef
      const [hour, minute] = scheduledTime ? scheduledTime.split(':').map(Number) : [0, 0]
      const rideStartTime = serviceDayStart.hour(hour).minute(minute).second(0).millisecond(0)
      let routeIds: number[] | undefined
      if (selectedRoute?.routeIds && selectedRoute.routeIds.length > 0) {
        routeIds = selectedRoute.routeIds
      } else if (scheduledLine && operatorId) {
        routeIds = (await getRoutesByLineRef(operatorId, scheduledLine, rideStartTime)).map(
          (route) => route.id,
        )
      }
      if (!routeIds || routeIds.length === 0) return []
      return await getStopsForRouteAsync(routeIds, rideStartTime)
    },
    // Key on the resolved route ids (not the date-stable lineRef): during a date
    // change the previous date's route is briefly still selected, and fetching
    // stops for it can yield an empty list. Keying on routeIds makes the query
    // refetch once selectedRoute corrects to the new date's route, instead of
    // caching that stale empty result under an unchanged key.
    queryKey: [
      'stops',
      selectedRoute?.routeIds?.join(','),
      serviceDayStart.valueOf(),
      parsedStartTime?.scheduledTime,
    ],
    enabled: !!(selectedRoute?.routeIds?.length || parsedStartTime?.lineRef),
  })

  return {
    positionGroups,
    plannedRouteStops: stopsQuery.data ?? [],
    options,
    startTime,
    locationsAreLoading,
    routes,
    routeKey: routeKey ?? undefined,
    error,
    setStartTime,
    setRouteKey,
  }
}

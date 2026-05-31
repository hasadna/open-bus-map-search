import { useQuery } from '@tanstack/react-query'
import { uniqBy } from 'es-toolkit/compat'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SIRI_API } from 'src/api/apiConfig'
import { getRoutesAsync, getRoutesByLineRef, getStopsForRouteAsync } from 'src/api/gtfsService'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { BusRoute } from 'src/model/busRoute'
import { type Point, toPoint } from 'src/pages/components/map-related/map-types'
import { routeStartEnd, vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'
import {
  normalizeStartTimeToken,
  parseStartTimeToken,
} from 'src/pages/components/utils/startTimeUtils'

const LIGHT_TRAIN_OPERATORS = new Set(['21', '22'])

const VEHICLE_NUMBER_TEST = {
  lightTrain: /^\d{1,6}$/,
  bus: /^\d{7,8}$/,
} as const

interface UseSingleLineDataOptions {
  operatorId?: string
  lineNumber?: string
  vehicleNumber?: number
  date: string
  routeKey?: string | null
  rideTime?: string | null
  onRouteKeyChange?: (routeKey: string | null) => void
  onRideTimeChange?: (rideTime: string | null) => void
}

export const useSingleLineData = ({
  operatorId,
  lineNumber,
  vehicleNumber,
  date,
  routeKey,
  rideTime,
  onRouteKeyChange,
  onRideTimeChange,
}: UseSingleLineDataOptions) => {
  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const [rideIdsByToken, setRideIdsByToken] = useState<Map<string, number[]>>(new Map())
  const [positions, setPositions] = useState<Point[]>([])
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
    const time = dayjs.tz(date, ISRAEL_TIMEZONE)

    getRoutesAsync(time, time, operatorId, lineNumber, controller.signal)
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

  const [today, serviceDayEnd] = useMemo(() => {
    const today = dayjs.tz(date, ISRAEL_TIMEZONE).startOf('day')
    // Service window: 00:00 of the selected day through 28:00 (04:00 next day).
    return [today, today.add(28, 'hours')]
  }, [date])

  const validVehicleNumber = useMemo(() => {
    if (!vehicleNumber) return undefined

    const vehicleNumberText = String(vehicleNumber)
    const isLightTrain = LIGHT_TRAIN_OPERATORS.has(operatorId ?? '')
    const vehicleNumberTest = isLightTrain
      ? VEHICLE_NUMBER_TEST.lightTrain
      : VEHICLE_NUMBER_TEST.bus

    return vehicleNumberTest.test(vehicleNumberText) ? vehicleNumber : undefined
  }, [operatorId, vehicleNumber])

  const parsedStartTime = useMemo(() => parseStartTimeToken(startTime), [startTime])

  const selectedRideIdsKey = useMemo(
    () => (startTime ? (rideIdsByToken.get(startTime) ?? []).join(',') : ''),
    [startTime, rideIdsByToken],
  )

  // Fetch departure list for the dropdown, grouping double trips into one entry
  useEffect(() => {
    if (!selectedRoute?.lineRef && !validVehicleNumber) {
      setOptions([])
      setRideIdsByToken(new Map())
      return
    }
    const controller = new AbortController()
    SIRI_API.siriRidesListGet(
      {
        siriRouteLineRefs: selectedRoute?.lineRef?.toString(),
        siriRouteOperatorRefs: operatorId,
        vehicleRefs: validVehicleNumber?.toString(),
        scheduledStartTimeFrom: today.toDate(),
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
          const totalMinutes = toIsraelTimezone(ride.scheduledStartTime).diff(today, 'minutes')
          const h = Math.floor(totalMinutes / 60)
          const m = totalMinutes % 60
          const scheduledTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
          const key = validVehicleNumber
            ? `${scheduledTime}|${ride.vehicleRef}|${ride.siriRouteLineRef}`
            : scheduledTime
          if (!byTime.has(key)) byTime.set(key, [])
          byTime.get(key)!.push({ id: ride.id, vehicleRef: ride.vehicleRef, ride })
        }

        const idMap = new Map<string, number[]>()
        const opts: { value: string; label: string }[] = []

        // Secondary guard: skip time slots with >4 vehicles at the same scheduled time.
        // Real double/triple trips have 2–3 vehicles max. >4 means a SIRI batch artifact
        // slipped past the +3h start-time filter (e.g. the batch ran late, after 03:00 IST).
        byTime.forEach((group, key) => {
          if (group.length > 4) return
          idMap.set(
            key,
            group.map((g) => g.id),
          )
          const scheduledTime = validVehicleNumber ? key.split('|')[0] : key
          const routeLongName = group[0].ride.gtfsRouteRouteLongName
          const [start, end] = routeLongName ? routeStartEnd(routeLongName) : []
          const routePart = routeLongName
            ? `${group[0].ride.gtfsRouteRouteShortName} - ${start} ⇄ ${end}`
            : undefined
          const label = validVehicleNumber
            ? routePart
              ? `${scheduledTime} (${routePart})`
              : scheduledTime
            : group.length === 1
              ? routePart
                ? `${scheduledTime} (${routePart}, ${vehicleIDFormat(group[0].vehicleRef)})`
                : `${scheduledTime} (${vehicleIDFormat(group[0].vehicleRef)})`
              : routePart
                ? `${scheduledTime} (${routePart}, ${group.length} vehicles)`
                : `${scheduledTime} (${group.length} vehicles)`
          opts.push({ value: key, label })
        })

        setOptions(opts)
        setRideIdsByToken(idMap)
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') console.error(err)
      })
    return () => controller.abort()
  }, [selectedRoute?.lineRef, operatorId, validVehicleNumber, today, serviceDayEnd])

  // Fetch location pings for the selected ride(s)
  useEffect(() => {
    const rideIds = selectedRideIdsKey ? selectedRideIdsKey.split(',').map(Number) : []
    if (!rideIds.length) {
      setPositions([])
      return
    }
    setLocationsAreLoading(true)
    Promise.all(
      rideIds.map((rideId) =>
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
        }),
      ),
    )
      .then((results) => setPositions(uniqBy(results.flat(), (l) => l.id).map(toPoint)))
      .catch(console.error)
      .finally(() => setLocationsAreLoading(false))
  }, [selectedRideIdsKey])

  // Fetch planned stops for the black polyline
  const stopsQuery = useQuery({
    queryFn: async () => {
      const scheduledTime = parsedStartTime?.scheduledTime
      const scheduledLine = parsedStartTime?.lineRef
      const [hour, minute] = scheduledTime ? scheduledTime.split(':').map(Number) : [0, 0]
      const startTimeTimestamp = today.hour(hour).minute(minute).second(0).millisecond(0)
      let routeIds: number[] | undefined
      if (selectedRoute?.routeIds && selectedRoute.routeIds.length > 0) {
        routeIds = selectedRoute.routeIds
      } else if (scheduledLine && operatorId) {
        routeIds = (
          await getRoutesByLineRef(operatorId, scheduledLine, startTimeTimestamp.toDate())
        ).map((route) => route.id)
      }
      if (!routeIds || routeIds.length === 0) return []
      return await getStopsForRouteAsync(routeIds, startTimeTimestamp)
    },
    queryKey: ['stops', selectedRoute?.lineRef, today.valueOf(), parsedStartTime?.scheduledTime],
    enabled: !!(selectedRoute?.routeIds?.length || parsedStartTime?.lineRef),
  })

  return {
    positions,
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

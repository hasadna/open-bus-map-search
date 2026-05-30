import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getRoutesAsync, getRoutesByLineRef, getStopsForRouteAsync } from 'src/api/gtfsService'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import useVehicleLocations from 'src/hooks/useVehicleLocations'
import { BusRoute } from 'src/model/busRoute'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
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

export const useSingleLineData = (
  operatorId?: string,
  lineNumber?: string,
  vehicleNumber?: number,
) => {
  const { search, setSearch } = useContext(SearchContext)
  // Routes are local: they are fetched per (operator, line, date) and have no
  // meaning outside this hook. They were removed from GlobalSearchState.
  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [routeKey, _setRouteKey] = useState<string | undefined>(search.routeKey ?? undefined)
  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  // rideTime (was 'startTime') is a specific ride's departure token, stored
  // in global state so gaps→single-line-map navigation passes it correctly.
  const rideTime = search.rideTime
  const [error, setError] = useState<string>()

  const setStartTime = useCallback(
    (startTime?: string) => {
      setSearch((prev) => ({ ...prev, rideTime: normalizeStartTimeToken(startTime) ?? null }))
    },
    [setSearch],
  )

  const setRouteKey = useCallback(
    (routeKey?: string) => {
      _setRouteKey(routeKey)
      setSearch((prev) => ({ ...prev, routeKey: routeKey ?? null }))
    },
    [setSearch],
  )

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      setRoutes(undefined)
      setRouteKey(undefined)
      setStartTime(undefined)
      setError(undefined)
      setSearch((prev) => ({
        ...prev,
        routeKey: null,
        rideTime: null,
      }))
      return
    }

    const controller = new AbortController()
    // Use global `date` (was `timestamp`) — the selected calendar day.
    const time = toIsraelTimezone(search.date)

    getRoutesAsync(time, time, operatorId, lineNumber, controller.signal)
      .then((fetched) => {
        setRoutes(fetched)
        setError(undefined)
      })
      .catch((err: unknown) => {
        if ((err as { cause?: { name?: string } })?.cause?.name !== 'AbortError') {
          setRoutes(undefined)
          setRouteKey(undefined)
          setError(err instanceof Error ? err.message : 'Failed to fetch routes')
        }
      })

    return () => {
      controller.abort()
    }
  }, [operatorId, lineNumber, search.date, setSearch, setRouteKey])

  const selectedRoute = useMemo(() => {
    return routes?.find((route) => route.key === routeKey)
  }, [routes, routeKey])

  const [today, serviceDayEnd] = useMemo(() => {
    // Parse the Israel date string as Israel local time (not browser local or UTC).
    // dayjs(str) is ambiguous in non-Israel timezones; dayjs.tz(str, tz) is explicit.
    const today = dayjs.tz(search.date, ISRAEL_TIMEZONE).startOf('day')
    // Israeli service day runs up to ~04:00 AM the next calendar day.
    // Use 30 hours to safely cover all past-midnight rides.
    return [today, today.add(30, 'hours')]
  }, [search.date])

  // Express position times as minutes-since-service-day-midnight so that
  // past-midnight rides get 24+ hour values (e.g. 01:30 AM = "25:30").
  // This matches the format GapsTable uses when building rideTime tokens.
  const formatTime = useCallback(
    (time: dayjs.ConfigType) => {
      const t = toIsraelTimezone(time)
      const totalMinutes = t.diff(today, 'minutes')
      const h = Math.floor(totalMinutes / 60)
      const m = totalMinutes % 60
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    },
    [today],
  )

  const validVehicleNumber = useMemo(() => {
    if (!vehicleNumber) return undefined

    const vehicleNumberText = String(vehicleNumber)
    const isLightTrain = LIGHT_TRAIN_OPERATORS.has(operatorId ?? '')
    const vehicleNumberTest = isLightTrain
      ? VEHICLE_NUMBER_TEST.lightTrain
      : VEHICLE_NUMBER_TEST.bus

    return vehicleNumberTest.test(vehicleNumberText) ? vehicleNumber : undefined
  }, [operatorId, vehicleNumber])

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: today.valueOf(),
    to: serviceDayEnd.valueOf(),
    operatorRef: operatorId ? Number(operatorId) : undefined,
    lineRef: selectedRoute?.lineRef ? Number(selectedRoute.lineRef) : undefined,
    vehicleRef: validVehicleNumber,
    splitMinutes: 360,
    pause: !operatorId || (!selectedRoute?.lineRef && !validVehicleNumber),
  })

  const positions = useMemo(() => {
    return locations
      .filter((l) =>
        validVehicleNumber ? Number(l.siriRideVehicleRef) === validVehicleNumber : true,
      )
      .map(toPoint)
  }, [locations, validVehicleNumber])

  useEffect(() => {
    const fetchOptions = async () => {
      const uniqueTimes = new Map<string, { scheduledTime: string; position: Point }>()
      for (const position of positions) {
        const startTime = position.point?.siriRideScheduledStartTime
        if (!startTime) continue
        const dayjsTime = toIsraelTimezone(startTime)
        if (dayjsTime.isAfter(today) && dayjsTime.isBefore(serviceDayEnd)) {
          const formattedTime = formatTime(dayjsTime)
          const key = `${formattedTime}|${position.point?.siriRideVehicleRef}`
          if (!uniqueTimes.has(key)) {
            uniqueTimes.set(key, { scheduledTime: formattedTime, position })
          }
        }
      }

      const optionsArray = Array.from(uniqueTimes.values()).sort((a, b) =>
        a.scheduledTime.localeCompare(b.scheduledTime),
      )

      if (vehicleNumber) {
        const optionsArray2 = await Promise.all(
          optionsArray.map(async (option) => {
            const routes = await getRoutesByLineRef(
              (option.position.point!.siriRouteOperatorRef ?? 0).toString(),
              (option.position.point!.siriRouteLineRef ?? 0).toString(),
              option.position.point!.recordedAtTime
                ? new Date(option.position.point!.recordedAtTime)
                : new Date(),
            )
            const [start, end] = routeStartEnd(routes[0]?.routeLongName)
            return {
              value: `${option.scheduledTime}|${option.position.point!.siriRideVehicleRef}|${option.position.point!.siriRouteLineRef}`,
              label: routes[0]?.routeLongName
                ? `${option.scheduledTime} (${routes[0]?.routeShortName} - ${start} ⇄ ${end})`
                : `${option.scheduledTime} (${vehicleIDFormat(option.position.point!.siriRideVehicleRef)})`,
            }
          }),
        )
        setOptions(optionsArray2)
      } else {
        setOptions(
          optionsArray.map((option) => ({
            value: `${option.scheduledTime}|${option.position.point!.siriRideVehicleRef}`,
            label: `${option.scheduledTime} (${vehicleIDFormat(option.position.point!.siriRideVehicleRef as string)})`,
          })),
        )
      }
    }

    fetchOptions()
  }, [positions, today, serviceDayEnd, vehicleNumber])

  useEffect(() => {
    const parsedStartTime = parseStartTimeToken(rideTime ?? undefined)
    if (!parsedStartTime) {
      setFilteredPositions([])
      return
    }
    const { scheduledTime, vehicleRef: scheduledVehicle, lineRef: scheduledLine } = parsedStartTime

    setFilteredPositions(
      positions.filter((position) => {
        const scheduledStart = position.point?.siriRideScheduledStartTime
        const vehicleRef = position.point?.siriRideVehicleRef?.toString()
        if (!scheduledStart || !vehicleRef || !scheduledTime) return false
        return (
          formatTime(scheduledStart) === scheduledTime &&
          (scheduledVehicle ? scheduledVehicle === vehicleRef : true) &&
          (scheduledLine ? scheduledLine === position.point?.siriRouteLineRef?.toString() : true)
        )
      }),
    )
  }, [rideTime, positions])

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const parsedStartTime = parseStartTimeToken(rideTime ?? undefined)
        const scheduledTime = parsedStartTime?.scheduledTime
        const scheduledLine = parsedStartTime?.lineRef
        const [hour, minute] = scheduledTime ? scheduledTime.split(':').map(Number) : [0, 0]
        const startTimeTimestamp = today.add(hour, 'hour').minute(minute).second(0).millisecond(0)
        let routeIds: number[] | undefined
        if (selectedRoute?.routeIds && selectedRoute.routeIds.length > 0) {
          routeIds = selectedRoute.routeIds
        } else if (scheduledLine && operatorId) {
          routeIds = (
            await getRoutesByLineRef(operatorId, scheduledLine, startTimeTimestamp.toDate())
          ).map((route) => route.id)
        }
        if (!routeIds || routeIds.length === 0) {
          setPlannedRouteStops([])
          return
        }
        const stops = await getStopsForRouteAsync(routeIds, startTimeTimestamp)
        setPlannedRouteStops(stops)
      } catch (err) {
        console.error(err)
        setPlannedRouteStops([])
      }
    }
    fetchStops()
  }, [selectedRoute?.routeIds, operatorId, rideTime, today])

  return {
    positions: filteredPositions,
    plannedRouteStops,
    options,
    startTime: normalizeStartTimeToken(rideTime ?? undefined),
    locationsAreLoading,
    routes,
    routeKey,
    error,
    setStartTime,
    setRouteKey,
  }
}

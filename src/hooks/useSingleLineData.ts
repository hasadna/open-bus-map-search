import { useCallback, useEffect, useMemo, useState } from 'react'
import { getRoutesAsync, getRoutesByLineRef, getStopsForRouteAsync } from 'src/api/gtfsService'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import useVehicleLocations from 'src/hooks/useVehicleLocations'
import { BusRoute } from 'src/model/busRoute'
import { BusStop } from 'src/model/busStop'
import { type Point, toPoint } from 'src/pages/components/map-related/map-types'
import { routeStartEnd, vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'
import {
  normalizeStartTimeToken,
  parseStartTimeToken,
} from 'src/pages/components/utils/startTimeUtils'

const formatTime = (time: dayjs.ConfigType) => toIsraelTimezone(time).format('HH:mm')

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
  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const [error, setError] = useState<string>()

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
      .catch((err) => {
        if (err?.cause?.name !== 'AbortError') {
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

  const [today, tomorrow] = useMemo(() => {
    const today = dayjs.tz(date, ISRAEL_TIMEZONE).startOf('day')
    return [today, today.add(1, 'day')]
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

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: today.valueOf(),
    to: tomorrow.valueOf(),
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
        if (dayjsTime.isAfter(today) && dayjsTime.isBefore(tomorrow)) {
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
              (option.position.point!.siriRouteOperatorRef || 0).toString(),
              (option.position.point!.siriRouteLineRef || 0).toString(),
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
          optionsArray.map((option) => {
            return {
              value: `${option.scheduledTime}|${option.position.point!.siriRideVehicleRef}`,
              label: `${option.scheduledTime} (${vehicleIDFormat(option.position.point!.siriRideVehicleRef)})`,
            }
          }),
        )
      }
    }

    fetchOptions()
  }, [positions, today, tomorrow, vehicleNumber])

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
        const startTimeTimestamp = today.hour(hour).minute(minute).second(0).millisecond(0)
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
    routeKey: routeKey ?? undefined,
    error,
    setStartTime,
    setRouteKey,
  }
}

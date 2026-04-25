import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getRoutesAsync, getRoutesByLineRef, getStopsForRouteAsync } from 'src/api/gtfsService'
import dayjs from 'src/dayjs'
import useVehicleLocations from 'src/hooks/useVehicleLocations'
import { BusRoute } from 'src/model/busRoute'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import { getServiceDayBounds } from 'src/model/serviceDay'
import { type Point, toPoint } from 'src/pages/components/map-related/map-types'
import { routeStartEnd, vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'
import {
  normalizeStartTimeToken,
  parseStartTimeToken,
} from 'src/pages/components/utils/startTimeUtils'

const formatTime = (time: dayjs.Dayjs) => time.format('HH:mm')

export const useSingleLineData = (
  operatorId?: string,
  lineNumber?: string,
  vehicleNumber?: number,
) => {
  const { search, setSearch } = useContext(SearchContext)
  const [routes, setRoutes] = useState<BusRoute[] | undefined>(search.routes)
  const [routeKey, _setRouteKey] = useState<string | undefined>(search.routeKey)
  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const { startTime } = search
  const [error, setError] = useState<string>()

  const setStartTime = useCallback(
    (startTime?: string) => {
      setSearch((prev) => ({ ...prev, startTime: normalizeStartTimeToken(startTime) }))
    },
    [setSearch],
  )

  const setRouteKey = useCallback(
    (routeKey?: string) => {
      _setRouteKey(routeKey)
      setSearch((prev) => ({ ...prev, routeKey }))
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
        routes: undefined,
        routeKey: undefined,
        startTime: undefined,
      }))
      return
    }

    const controller = new AbortController()
    const time = dayjs(search.timestamp)

    getRoutesAsync(time, time, operatorId, lineNumber, controller.signal)
      .then((routes) => {
        setRoutes(routes)
        setSearch((prev) => ({ ...prev, routes }))
        setError(undefined)
      })
      .catch((err) => {
        if (err?.cause?.name !== 'AbortError') {
          setRoutes(undefined)
          setSearch((prev) => ({ ...prev, routes: undefined }))
          setRouteKey(undefined)
          setError(err instanceof Error ? err.message : 'Failed to fetch routes')
        }
      })

    return () => {
      controller.abort()
    }
  }, [operatorId, lineNumber, search.timestamp, setSearch, setRouteKey])

  const selectedRoute = useMemo(() => {
    return routes?.find((route) => route.key === routeKey)
  }, [routes, routeKey])

  const [serviceDayStart, serviceDayEnd] = useMemo(() => {
    const { start, end } = getServiceDayBounds(dayjs(search.timestamp))
    return [start, end]
  }, [search.timestamp])

  const validVehicleNumber = useMemo(() => {
    return vehicleNumber && /^\d{7,8}$/.test(vehicleNumber.toString())
      ? Number(vehicleNumber)
      : undefined
  }, [vehicleNumber])

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: serviceDayStart.valueOf(),
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
        const dayjsTime = dayjs(startTime)
        if (!dayjsTime.isBefore(serviceDayStart) && dayjsTime.isBefore(serviceDayEnd)) {
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

    void fetchOptions()
  }, [positions, serviceDayStart, serviceDayEnd, vehicleNumber])

  useEffect(() => {
    const parsedStartTime = parseStartTimeToken(startTime)
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
          formatTime(dayjs(scheduledStart)) === scheduledTime &&
          (scheduledVehicle ? scheduledVehicle === vehicleRef : true) &&
          (scheduledLine ? scheduledLine === position.point?.siriRouteLineRef?.toString() : true)
        )
      }),
    )
  }, [startTime, positions])

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const parsedStartTime = parseStartTimeToken(startTime)
        const scheduledTime = parsedStartTime?.scheduledTime
        const scheduledLine = parsedStartTime?.lineRef
        const [hour, minute] = scheduledTime ? scheduledTime.split(':').map(Number) : [0, 0]
        const startTimeTimestamp = serviceDayStart
          .hour(hour)
          .minute(minute)
          .second(0)
          .millisecond(0)
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
    void fetchStops()
  }, [selectedRoute?.routeIds, operatorId, startTime, serviceDayStart])

  return {
    positions: filteredPositions,
    plannedRouteStops,
    options,
    startTime: normalizeStartTimeToken(startTime),
    locationsAreLoading,
    routes,
    routeKey,
    error,
    setStartTime,
    setRouteKey,
  }
}

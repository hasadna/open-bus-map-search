import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getRoutesAsync, getRoutesByLineRef, getStopsForRouteAsync } from 'src/api/gtfsService'
import useVehicleLocations from 'src/api/useVehicleLocations'
import dayjs from 'src/dayjs'
import { BusRoute } from 'src/model/busRoute'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import { routeStartEnd, vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'
import { Point } from 'src/pages/timeBasedMap'

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
      setSearch((prev) => ({ ...prev, startTime }))
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

  const [today, tomorrow] = useMemo(() => {
    const today = dayjs(search.timestamp).startOf('day')
    return [today, today.add(1, 'day')]
  }, [search.timestamp])

  const validVehicleNumber = useMemo(() => {
    return vehicleNumber && /^\d{7,8}$/.test(vehicleNumber.toString())
      ? Number(vehicleNumber)
      : undefined
  }, [vehicleNumber])

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
        validVehicleNumber ? Number(l.siri_ride__vehicle_ref) === validVehicleNumber : true,
      )
      .map<Point>((location) => ({
        loc: [location.lat, location.lon],
        color: location.velocity,
        operator: location.siri_route__operator_ref,
        bearing: location.bearing,
        recorded_at_time: new Date(location.recorded_at_time).getTime(),
        point: location,
      }))
  }, [locations, validVehicleNumber])

  useEffect(() => {
    const fetchOptions = async () => {
      const uniqueTimes = new Map<string, { scheduledTime: string; position: Point }>()
      for (const position of positions) {
        const startTime = position.point?.siri_ride__scheduled_start_time
        if (!startTime) continue
        const dayjsTime = dayjs(startTime)
        if (dayjsTime.isAfter(today) && dayjsTime.isBefore(tomorrow)) {
          const formattedTime = formatTime(dayjsTime)
          const key = `${formattedTime}|${position.point?.siri_ride__vehicle_ref}`
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
              option.position.point!.siri_route__operator_ref.toString(),
              option.position.point!.siri_route__line_ref.toString(),
              new Date(option.position.point!.recorded_at_time),
            )
            const [start, end] = routeStartEnd(routes[0]?.routeLongName)
            return {
              value: `${option.scheduledTime}|${option.position.point!.siri_ride__vehicle_ref}|${option.position.point!.siri_route__line_ref}`,
              label: routes[0]?.routeLongName
                ? `${option.scheduledTime} (${routes[0]?.routeShortName} - ${start} ⇄ ${end})`
                : `${option.scheduledTime} (${vehicleIDFormat(option.position.point!.siri_ride__vehicle_ref)})`,
            }
          }),
        )
        setOptions(optionsArray2)
      } else {
        setOptions(
          optionsArray.map((option) => {
            return {
              value: `${option.scheduledTime}|${option.position.point!.siri_ride__vehicle_ref}`,
              label: `${option.scheduledTime} (${vehicleIDFormat(option.position.point!.siri_ride__vehicle_ref)})`,
            }
          }),
        )
      }
    }

    fetchOptions()
  }, [positions, today, tomorrow, vehicleNumber])

  useEffect(() => {
    if (!startTime) {
      setFilteredPositions([])
      return
    }
    const [scheduledTime, scheduledVehicle, scheduledLine] = startTime.split('|')

    setFilteredPositions(
      positions.filter((position) => {
        const scheduledStart = position.point?.siri_ride__scheduled_start_time
        const vehicleRef = position.point?.siri_ride__vehicle_ref.toString()
        if (!scheduledStart || !vehicleRef || !scheduledTime || !scheduledVehicle) return false
        return (
          formatTime(dayjs(scheduledStart)) === scheduledTime &&
          scheduledVehicle === vehicleRef &&
          (scheduledLine ? scheduledLine === position.point?.siri_route__line_ref.toString() : true)
        )
      }),
    )
  }, [startTime, positions])

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const [scheduledTime, , scheduledLine] = startTime?.split('|') || [
          undefined,
          undefined,
          undefined,
        ]
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
  }, [selectedRoute?.routeIds, operatorId, startTime, today])

  return {
    positions: filteredPositions,
    plannedRouteStops,
    options,
    startTime,
    locationsAreLoading,
    routes,
    routeKey,
    error,
    setStartTime,
    setRouteKey,
  }
}

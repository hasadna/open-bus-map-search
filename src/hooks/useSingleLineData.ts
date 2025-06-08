import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getRoutesAsync, getStopsForRouteAsync } from 'src/api/gtfsService' // getRoutesByLineRef
import useVehicleLocations from 'src/api/useVehicleLocations'
import { BusStop } from 'src/model/busStop'
import { BusRoute } from 'src/model/busRoute'
import { SearchContext } from 'src/model/pageState'
import { Point } from 'src/pages/timeBasedMap'
import dayjs from 'src/dayjs'
import { vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'

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
  const [startTime, setStartTime] = useState<string>()
  const [error, setError] = useState<string>()

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
      setSearch((prev) => ({ ...prev, routes: undefined, routeKey: undefined }))
      return
    }

    const controller = new AbortController()
    const time = dayjs(search.timestamp)

    getRoutesAsync(time, time, operatorId, lineNumber, controller.signal)
      .then((routes) => {
        setRoutes(routes)
        setSearch((prev) => ({ ...prev, routes }))
        setError(undefined)
        setStartTime(undefined)
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

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: today.valueOf(),
    to: tomorrow.valueOf(),
    operatorRef: operatorId ? Number(operatorId) : undefined,
    lineRef: selectedRoute?.lineRef ? Number(selectedRoute.lineRef) : undefined,
    vehicleRef: vehicleNumber ? Number(vehicleNumber) : undefined,
    splitMinutes: 360,
    pause: !operatorId || (!selectedRoute?.lineRef && !vehicleNumber),
  })

  const positions = useMemo(() => {
    return locations.map<Point>((location) => ({
      loc: [location.lat, location.lon],
      color: location.velocity,
      operator: location.siri_route__operator_ref,
      bearing: location.bearing,
      recorded_at_time: new Date(location.recorded_at_time).getTime(),
      point: location,
    }))
  }, [locations])

  const options = useMemo(() => {
    const uniqueTimes = new Set<string>()
    for (const position of positions) {
      const startTime = position.point?.siri_ride__scheduled_start_time
      const vehicleRef = position.point?.siri_ride__vehicle_ref
      if (startTime) {
        const dayjsTime = dayjs(startTime)
        if (dayjsTime.isAfter(today) && dayjsTime.isBefore(tomorrow)) {
          uniqueTimes.add(`${formatTime(dayjsTime)} (${vehicleIDFormat(vehicleRef)})`)
        }
      }
    }
    return Array.from(uniqueTimes)
      .sort()
      .map((time) => ({ value: time, label: time }))
  }, [positions, today, tomorrow])

  useEffect(() => {
    if (!startTime) {
      setFilteredPositions([])
      return
    }
    const [scheduledTime, scheduledVehicle] = startTime.slice(0, -1).split(' (')
    setFilteredPositions(
      positions.filter((position) => {
        const scheduledStart = position.point?.siri_ride__scheduled_start_time
        const vehicleRef = position.point?.siri_ride__vehicle_ref
        if (!scheduledStart || !vehicleRef || !scheduledTime || !scheduledVehicle) return false
        return (
          formatTime(dayjs(scheduledStart)) === scheduledTime &&
          scheduledVehicle === vehicleIDFormat(vehicleRef)
        )
      }),
    )
  }, [startTime, positions])

  useEffect(() => {
    if (!selectedRoute?.routeIds?.length) {
      setPlannedRouteStops([])
      return
    }
    const fetchStops = async () => {
      try {
        const scheduledTime = startTime?.slice(0, -1).split(' (')[0]
        const [hour, minute] = scheduledTime ? scheduledTime.split(':').map(Number) : [0, 0]
        const startTimeTimestamp = today.hour(hour).minute(minute).second(0).millisecond(0)
        const stops = await getStopsForRouteAsync(selectedRoute.routeIds, startTimeTimestamp)
        setPlannedRouteStops(stops)
      } catch (err) {
        console.error(err)
        setPlannedRouteStops([])
      }
    }
    fetchStops()
  }, [selectedRoute?.routeIds, startTime, today])

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

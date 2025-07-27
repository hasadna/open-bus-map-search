import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getGTFSRoutes, getStopsForRouteAsync } from 'src/api/gtfsService'
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

    getGTFSRoutes({
      from: time.valueOf(),
      operatorId,
      routeShortName: lineNumber,
      signal: controller.signal,
      toBusRoute: true,
    })
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
  // 23311102
  const validVehicleNumber = useMemo(() => {
    return vehicleNumber && /^\d{1,8}$/.test(vehicleNumber.toString())
      ? Number(vehicleNumber)
      : undefined
  }, [vehicleNumber])

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: today.valueOf(),
    to: tomorrow.valueOf(),
    operatorRef: operatorId,
    lineRef: selectedRoute?.lineRef.toString(),
    vehicleRef: validVehicleNumber?.toString(),
    splitMinutes: 360,
    pause: !operatorId || (!selectedRoute?.lineRef && !validVehicleNumber),
  })

  const positions = useMemo(() => {
    return locations
      .filter((l) =>
        validVehicleNumber ? Number(l.siriRideVehicleRef) === validVehicleNumber : true,
      )
      .map<Point>((location) => ({
        loc: [location.lat || NaN, location.lon || NaN],
        color: location.velocity || 0,
        operator: location.siriRouteOperatorRef,
        bearing: location.bearing,
        recorded_at_time: location.recordedAtTime?.getTime(),
        point: location,
      }))
  }, [locations, validVehicleNumber])

  useEffect(() => {
    const fetchOptions = async () => {
      const uniqueTimes = new Map<string, { scheduledTime: string; position: Point }>()
      for (const position of positions) {
        const startTime = position.point?.siriRideScheduledStartTime
        if (!startTime) continue
        const dayjsTime = dayjs(startTime)
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
            const routes = await getGTFSRoutes({
              operatorId: option.position.point?.siriRouteOperatorRef?.toString(),
              lineRefs: option.position.point?.siriRouteLineRef?.toString(),
              from: option.position.point!.recordedAtTime?.valueOf() || Date.now(),
              limit: 1,
            })
            const [start, end] = routeStartEnd(routes[0]?.routeLongName)
            return {
              value: `${option.scheduledTime}|${option.position.point?.siriRideVehicleRef}|${option.position.point?.siriRouteLineRef}`,
              label: routes[0]?.routeLongName
                ? `${option.scheduledTime} (${routes[0]?.routeShortName} - ${start} ⇄ ${end})`
                : `${option.scheduledTime} (${vehicleIDFormat(option.position.point?.siriRideVehicleRef)})`,
            }
          }),
        )
        setOptions(optionsArray2)
      } else {
        setOptions(
          optionsArray.map((option) => {
            return {
              value: `${option.scheduledTime}|${option.position.point?.siriRideVehicleRef}`,
              label: `${option.scheduledTime} (${vehicleIDFormat(option.position.point?.siriRideVehicleRef)})`,
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
        const scheduledStart = position.point?.siriRideScheduledStartTime
        const vehicleRef = position.point?.siriRideVehicleRef
        if (!scheduledStart || !vehicleRef || !scheduledTime || !scheduledVehicle) return false
        return (
          formatTime(dayjs(scheduledStart)) === scheduledTime &&
          scheduledVehicle === vehicleRef &&
          (scheduledLine ? scheduledLine === position.point?.siriRouteLineRef?.toString() : true)
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
            await getGTFSRoutes({
              from: startTimeTimestamp.valueOf(),
              operatorId,
              lineRefs: scheduledLine,
              limit: 1,
            })
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

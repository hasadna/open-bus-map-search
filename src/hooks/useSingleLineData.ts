import { uniqBy } from 'es-toolkit/compat'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SIRI_API } from 'src/api/apiConfig'
import { getRoutesAsync, getRoutesByLineRef, getStopsForRouteAsync } from 'src/api/gtfsService'
import dayjs, { toIsraelTimezone } from 'src/dayjs'
import { BusRoute } from 'src/model/busRoute'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import {
  type PositionGroup,
  ROUTE_COLORS,
  toPoint,
} from 'src/pages/components/map-related/map-types'
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

export const useSingleLineData = (
  operatorId?: string,
  lineNumber?: string,
  vehicleNumber?: number,
) => {
  const { search, setSearch } = useContext(SearchContext)
  const [routes, setRoutes] = useState<BusRoute[] | undefined>(search.routes)
  const [routeKey, _setRouteKey] = useState<string | undefined>(search.routeKey)
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const [rideIdsByToken, setRideIdsByToken] = useState<Map<string, number[]>>(new Map())
  const [vehicleRefById, setVehicleRefById] = useState<Map<number, string>>(new Map())
  const [positionGroups, setPositionGroups] = useState<PositionGroup[]>([])
  const [locationsAreLoading, setLocationsAreLoading] = useState(false)
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
    const time = toIsraelTimezone(search.timestamp)

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
    const today = toIsraelTimezone(search.timestamp).startOf('day')
    return [today, today.add(1, 'day')]
  }, [search.timestamp])

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
      setVehicleRefById(new Map())
      return
    }
    const controller = new AbortController()
    SIRI_API.siriRidesListGet(
      {
        siriRouteLineRefs: selectedRoute?.lineRef?.toString(),
        siriRouteOperatorRefs: operatorId,
        vehicleRefs: validVehicleNumber?.toString(),
        // Primary guard against the midnight SIRI batch: every day at ~00:00 the backend
        // mass-creates phantom siri_ride records for all tracked vehicles, which can fill the
        // entire 500-result page leaving no real rides. Skipping to 03:00 avoids them in line
        // mode. Vehicle mode is exempt — the query already filters to one vehicle so there is
        // no flood risk, and real early-morning trips (04:00–06:00) must not be hidden.
        scheduledStartTimeFrom: validVehicleNumber ? today.toDate() : today.add(3, 'hour').toDate(),
        scheduledStartTimeTo: tomorrow.toDate(),
        orderBy: 'scheduled_start_time asc',
        limit: 500,
      },
      { signal: controller.signal },
    )
      .then((rides) => {
        // group by scheduledTime — multiple vehicles at the same time = double trip
        const byTime = new Map<
          string,
          { id: number; vehicleRef: string; ride: (typeof rides)[0] }[]
        >()
        for (const ride of rides) {
          if (!ride.scheduledStartTime || !ride.vehicleRef || !ride.id) continue
          const scheduledTime = toIsraelTimezone(ride.scheduledStartTime).format('HH:mm')
          const key = validVehicleNumber
            ? `${scheduledTime}|${ride.vehicleRef}|${ride.siriRouteLineRef}`
            : scheduledTime
          if (!byTime.has(key)) byTime.set(key, [])
          byTime.get(key)!.push({ id: ride.id, vehicleRef: ride.vehicleRef, ride })
        }

        const idMap = new Map<string, number[]>()
        const vehMap = new Map<number, string>()
        const opts: { value: string; label: string }[] = []

        // Secondary guard: skip time slots with >4 vehicles at the same scheduled time.
        // Real double/triple trips have 2–3 vehicles max. >4 means a SIRI batch artifact slipped
        // past the +3h start-time filter (e.g. the batch ran late, after 03:00 IST).
        byTime.forEach((group, key) => {
          if (group.length > 4) return
          idMap.set(
            key,
            group.map((g) => g.id),
          )
          group.forEach((g) => vehMap.set(g.id, g.vehicleRef))
          const scheduledTime = toIsraelTimezone(group[0].ride.scheduledStartTime).format('HH:mm')
          const routeLongName = group[0].ride.gtfsRouteRouteLongName
          const [start, end] = routeLongName ? routeStartEnd(routeLongName) : []
          const routePart = routeLongName
            ? `${group[0].ride.gtfsRouteRouteShortName} - ${start} ⇄ ${end}`
            : undefined
          // In vehicle mode the user already knows which vehicle — show route info without repeating the ref
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
        setVehicleRefById(vehMap)
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') console.error(err)
      })
    return () => controller.abort()
  }, [selectedRoute?.lineRef, operatorId, validVehicleNumber, today, tomorrow])

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
          positions: uniqBy(data, (l) => l.id).map(toPoint),
        })),
      ),
    )
      .then(setPositionGroups)
      .catch(console.error)
      .finally(() => setLocationsAreLoading(false))
  }, [selectedRideIdsKey, vehicleRefById])

  // Fetch planned stops for the black polyline
  useEffect(() => {
    const fetchStops = async () => {
      try {
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
  }, [selectedRoute?.routeIds, operatorId, parsedStartTime, today])

  return {
    positionGroups,
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

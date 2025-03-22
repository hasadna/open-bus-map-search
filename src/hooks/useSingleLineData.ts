import axios from 'axios'
import moment, { Moment } from 'moment'
import { useContext, useEffect, useMemo, useState } from 'react'
import { getGapsAsync } from 'src/api/gapsService'
import { getStopsForRouteAsync } from 'src/api/gtfsService'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import { Point } from 'src/pages/timeBasedMap'

export const useSingleLineData = (lineRef?: number, routeIds?: number[]) => {
  const { search } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search

  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [startTime, setStartTime] = useState<string | null>(null)
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])
  const [gaps, setGaps] = useState<Moment[]>([])

  const [today, tomorrow] = useMemo(() => {
    const today = moment(timestamp).startOf('day')
    const tomorrow = moment(today).add(1, 'day')
    return [today, tomorrow]
  }, [timestamp])

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: today,
    to: tomorrow,
    lineRef,
    splitMinutes: 360,
    pause: !lineRef,
  })

  const positions = useMemo(() => {
    const pos = locations.map<Point>((location) => ({
      loc: [location.lat, location.lon],
      color: location.velocity,
      operator: location.siri_route__operator_ref,
      bearing: location.bearing,
      recorded_at_time: new Date(location.recorded_at_time).getTime(),
      point: location,
    }))

    return pos
  }, [locations])

  const formatTime = (time: string | Moment) => moment(time).format('HH:mm:ss')

  const calculateStartTimeTimestamp = (startTime: string, today: Moment) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    return today.clone().set({ hour: hours, minute: minutes, second: 0, millisecond: 0 }).valueOf()
  }

  const options = useMemo(() => {
    const uniqueTimes = new Map<string, boolean>()

    positions.forEach((position) => {
      const time = position.point?.siri_ride__scheduled_start_time
      if (time && moment(time).isAfter(today)) {
        uniqueTimes.set(formatTime(time), false)
      }
    })

    gaps.forEach((gap) => {
      uniqueTimes.set(formatTime(gap), true)
    })

    return Array.from(uniqueTimes.entries())
      .sort(([a], [b]) => moment(a, 'HH:mm:ss').diff(moment(b, 'HH:mm:ss')))
      .map(([time, gap]) => ({
        value: time,
        label: time,
        gap: gap,
      }))
  }, [positions, today, gaps])

  useEffect(() => {
    if (startTime) {
      const filtered = positions.filter((position) => {
        const scheduledTime = position.point?.siri_ride__scheduled_start_time
        return scheduledTime && formatTime(scheduledTime) === startTime
      })
      setFilteredPositions(filtered)
    } else {
      setFilteredPositions([])
    }
  }, [startTime, positions, options])

  useEffect(() => {
    if (routeIds?.length && routeKey) {
      const startTimeTimestamp = calculateStartTimeTimestamp(startTime || '', today)
      handlePlannedRouteStops(routeIds, startTimeTimestamp)
    } else {
      setPlannedRouteStops([])
    }
  }, [startTime, routeIds, today])

  const handlePlannedRouteStops = async (routeIds: number[], startTimeTs: number) => {
    const stops = await getStopsForRouteAsync(routeIds, moment(startTimeTs))
    setPlannedRouteStops(stops)
  }

  useEffect(() => {
    if (
      !operatorId ||
      !routes ||
      !routeKey ||
      !timestamp ||
      !routes.some((route) => route.key === routeKey)
    ) {
      setGaps([])
      return
    }

    const selectedRoute = routes.find((route) => route.key === routeKey)!
    const source = axios.CancelToken.source()
    const today = moment(timestamp).startOf('day')

    const fetchGaps = async () => {
      try {
        const gaps = await getGapsAsync(
          today,
          today,
          operatorId,
          selectedRoute.lineRef,
          source.token,
        )
        const filteredGaps = gaps
          .filter((gap) => !gap.gtfsTime || !gap.siriTime)
          .map((gap) => moment(gap.gtfsTime || gap.siriTime))
        setGaps(filteredGaps)
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Failed to fetch gaps:', err instanceof Error ? err.message : err)
        }
        setGaps([])
      }
    }

    fetchGaps()

    return () => source.cancel('Operation canceled by the user.')
  }, [operatorId, routes, routeKey, timestamp])

  return {
    locationsAreLoading,
    positions,
    options,
    filteredPositions,
    plannedRouteStops,
    startTime,
    setStartTime,
  }
}

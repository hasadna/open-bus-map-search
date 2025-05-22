import dayjs from 'dayjs'
import { useContext, useEffect, useMemo, useState } from 'react'
import { getStopsForRouteAsync } from 'src/api/gtfsService'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import { Point } from 'src/pages/timeBasedMap'

const formatTime = (time: dayjs.Dayjs) => time.format('HH:mm:ss')

export const useSingleLineData = (lineRef?: number, routeIds?: number[]) => {
  const {
    search: { timestamp },
  } = useContext(SearchContext)

  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])
  const [startTime, setStartTime] = useState<string>()

  const [today, tomorrow] = useMemo(() => {
    const today = dayjs(timestamp).startOf('day')
    return [today, today.add(1, 'day')]
  }, [timestamp])

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: today.valueOf(),
    to: tomorrow.valueOf(),
    lineRef,
    splitMinutes: 360,
    pause: !lineRef,
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
      if (startTime) {
        const dayjsTime = dayjs(startTime)
        if (dayjsTime.isAfter(today) && dayjsTime.isBefore(tomorrow)) {
          uniqueTimes.add(formatTime(dayjsTime))
        }
      }
    }

    return Array.from(uniqueTimes)
      .sort()
      .map((time) => ({ value: time, label: time }))
  }, [positions, today, tomorrow])

  // Set Bus Postions
  useEffect(() => {
    if (!startTime) {
      setFilteredPositions([])
      return
    }

    const filtered = positions.filter((position) => {
      const scheduledTime = position.point?.siri_ride__scheduled_start_time
      return scheduledTime && formatTime(dayjs(scheduledTime)) === startTime
    })

    setFilteredPositions(filtered)
  }, [startTime, positions])

  // Set Planned Route Stops
  useEffect(() => {
    if (!routeIds?.length) {
      setPlannedRouteStops([])
      return
    }

    const fetchStops = async () => {
      const [hour, minute] = startTime ? startTime.split(':').map(Number) : [0, 0]
      const startTimeTimestamp = today
        .set('hour', hour)
        .set('minute', minute)
        .set('second', 0)
        .set('millisecond', 0)
      const stops = await getStopsForRouteAsync(routeIds, startTimeTimestamp)
      setPlannedRouteStops(stops)
    }

    fetchStops()
  }, [routeIds, startTime, today])

  return {
    positions: filteredPositions,
    plannedRouteStops,
    options,
    startTime,
    setStartTime,
    locationsAreLoading,
  }
}

import moment from 'moment'
import { useContext, useEffect, useMemo, useState } from 'react'
import { getStopsForRouteAsync } from 'src/api/gtfsService'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import { Point } from 'src/pages/timeBasedMap'

const formatTime = (time: moment.Moment) => time.format('HH:mm:ss')

export const useSingleLineData = (lineRef?: number, routeIds?: number[]) => {
  const {
    search: { timestamp },
  } = useContext(SearchContext)

  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [startTime, setStartTime] = useState<string>()
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])

  const [selectDay, nextDay] = useMemo(() => {
    const selectDay = moment(timestamp).startOf('day')
    return [selectDay, selectDay.clone().add(1, 'day')]
  }, [timestamp])

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: selectDay,
    to: nextDay,
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
        const momentTime = moment(startTime)
        if (momentTime.isBetween(selectDay, nextDay)) {
          uniqueTimes.add(formatTime(momentTime))
        }
      }
    }

    return Array.from(uniqueTimes)
      .sort()
      .map((time) => ({ value: time, label: time }))
  }, [positions, selectDay, nextDay])

  // Set Bus Postions
  const filteredBusPositions = useMemo(() => {
    if (!startTime) return []

    return positions.filter((position) => {
      const scheduledTime = position.point?.siri_ride__scheduled_start_time
      return scheduledTime && formatTime(moment(scheduledTime)) === startTime
    })
  }, [startTime, positions])

  useEffect(() => {
    setFilteredPositions(filteredBusPositions)
  }, [filteredBusPositions])

  // Set Bus Planned Stop
  useEffect(() => {
    const abortController = new AbortController()

    if (routeIds?.length) {
      const [hour, minute] = startTime ? startTime.split(':').map(Number) : [0, 0]
      const startTimeTimestamp = selectDay.clone().set({ hour, minute, second: 0, millisecond: 0 })

      getStopsForRouteAsync(routeIds, startTimeTimestamp)
        .then((stops) => {
          if (!abortController.signal.aborted) {
            setPlannedRouteStops(stops)
          }
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            setPlannedRouteStops([])
          }
        })
    } else {
      setPlannedRouteStops([])
    }

    return () => abortController.abort()
  }, [startTime, selectDay, routeIds])

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

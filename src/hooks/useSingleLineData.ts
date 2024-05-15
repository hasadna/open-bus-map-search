import moment from 'moment'
import { useContext, useEffect, useMemo, useState } from 'react'
import { getStopsForRouteAsync } from 'src/api/gtfsService'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import { Point } from 'src/pages/timeBasedMap'

export const useSingleLineData = (lineRef?: number, routeIds?: number[]) => {
  const {
    search: { timestamp },
  } = useContext(SearchContext)
  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [startTime, setStartTime] = useState<string>('00:00:00')
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: +new Date(timestamp).setHours(0, 0, 0, 0),
    to: +new Date(timestamp).setHours(23, 59, 59, 999),
    lineRef,
    splitMinutes: 20,
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

  const options = useMemo(() => {
    const options = positions
      .map((position) => position.point?.siri_ride__scheduled_start_time) // get all start times
      .filter((time, i, arr) => arr.indexOf(time) === i) // unique
      .map((time) => new Date(time ?? 0).toLocaleTimeString()) // convert to strings
      .map((time) => ({
        // convert to options
        value: time,
        label: time,
      }))
    return options
  }, [positions])

  useEffect(() => {
    if (startTime !== '00:00:00' && positions.length > 0) {
      setFilteredPositions(
        positions.filter(
          (position) =>
            new Date(position.point?.siri_ride__scheduled_start_time ?? 0).toLocaleTimeString() ===
            startTime,
        ),
      )
    }
    if (startTime !== '00:00:00') {
      const [hours, minutes] = startTime.split(':')
      const startTimeTimestamp = +new Date(
        positions[0].point?.siri_ride__scheduled_start_time ?? 0,
      ).setHours(+hours, +minutes, 0, 0)
      handlePlannedRouteStops(routeIds ?? [], startTimeTimestamp)
    }
  }, [startTime])

  const handlePlannedRouteStops = async (routeIds: number[], startTimeTs: number) => {
    const stops = await getStopsForRouteAsync(routeIds, moment(startTimeTs))
    setPlannedRouteStops(stops)
  }

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

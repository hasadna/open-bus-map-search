import moment from 'moment'
import { useContext, useEffect, useMemo, useState } from 'react'
import { getStopsForRouteAsync } from 'src/api/gtfsService'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import { Point } from 'src/pages/timeBasedMap'

export const useSingleVehicleData = (vehicleRef?: number, routeIds?: number[]) => {
  const {
    search: { timestamp },
  } = useContext(SearchContext)
  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [startTime, setStartTime] = useState<string>('00:00:00')
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]>([])

  const today = new Date(timestamp)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: +today.setHours(0, 0, 0, 0),
    to: +tomorrow.setHours(0, 0, 0, 0),
    vehicleRef,
    splitMinutes: 360,
    pause: !vehicleRef,
  })
  // console.log('locations:', locations) // הוסף הודעת לוג כאן

  const positions = useMemo(() => {
    const pos = locations
      .filter((location) => location.siri_ride__vehicle_ref == vehicleRef)
      .map<Point>((location) => ({
        loc: [location.lat, location.lon],
        color: location.velocity,
        operator: location.siri_route__operator_ref,
        bearing: location.bearing,
        recorded_at_time: new Date(location.recorded_at_time).getTime(),
        point: location,
      }))
    return pos
  }, [locations])

  function convertTo24HourAndToNumber(time: string): number {
    const match = time.match(/(\d+):(\d+):(\d+)\s(AM|PM)/)
    if (!match) return 0

    const [, hour, minute, , modifier] = match
    let newHour = parseInt(hour, 10)
    if (modifier === 'AM' && newHour === 12) newHour = 0
    if (modifier === 'PM' && newHour !== 12) newHour += 12

    return newHour * 60 + parseInt(minute, 10)
  }

  const options = useMemo(() => {
    const filteredPositions = positions.filter((position) => {
      const startTime = position.point?.siri_ride__scheduled_start_time
      return !!startTime && +new Date(startTime) > +today.setHours(0, 0, 0, 0)
    })

    if (filteredPositions.length === 0) return []

    const uniqueTimes = Array.from(
      new Set(
        filteredPositions
          .map((position) => position.point?.siri_ride__scheduled_start_time)
          .filter((time): time is string => !!time)
          .map((time) => time.trim()),
      ),
    )
      .map((time) => new Date(time).toLocaleTimeString()) // Convert to 24-hour time string
      .map((time) => ({
        value: time,
        label: time,
      }))

    const sortedOptions = uniqueTimes.sort(
      (a, b) => convertTo24HourAndToNumber(a.value) - convertTo24HourAndToNumber(b.value),
    )

    return sortedOptions
  }, [positions])
//עדכון ברירת מחדל ל-startTime כאשר יש options
  useEffect(() => {
    if (options.length > 0 && startTime === '00:00:00') {
      setStartTime(options[0].value)
      // console.log('Updated startTime to:', options[0].value)
    }
  }, [options])
  
  // חיפוש לפי startTime
  useEffect(() => {
    if (positions.length === 0) {
      console.warn('No positions available to filter.')
      return
    }
    // console.log('Start time:', startTime)

    if (startTime !== '00:00:00') {
      const newFilteredPositions = positions.filter((position) => {
        const scheduledStartTime = moment(
          position.point?.siri_ride__scheduled_start_time,
        ).utc().format('HH:mm:ss') // המרת הזמן לפורמט HH:mm:ss

        const formattedStartTime = moment(startTime, 'HH:mm:ss').utc().format('HH:mm:ss')

        // console.log('Scheduled start time (formatted):', scheduledStartTime)
        // console.log('Start time (formatted):', formattedStartTime)
        // console.log('Comparison result:', scheduledStartTime === formattedStartTime);
        return scheduledStartTime === formattedStartTime
      })
      setFilteredPositions(newFilteredPositions)
      // console.log('New filtered positions:', newFilteredPositions)
    }

    if (positions.length > 0 && startTime !== '00:00:00') {
      const [hours, minutes] = startTime.split(':')
      const startTimeTimestamp = +new Date(
        positions[0].point?.siri_ride__scheduled_start_time ?? 0,
      ).setHours(+hours, +minutes, 0, 0)
      handlePlannedRouteStops(routeIds ?? [], startTimeTimestamp)
    }
  }, [startTime, positions])

  // הפונקציה להוצאת תחנות למזהה רכבת (או רכב)
  const handlePlannedRouteStops = async (routeIds: number[], startTimeTs: number) => {
    try {
      const stops = await getStopsForRouteAsync(routeIds, moment(startTimeTs))
      // console.log('Retrieved stops:', stops)
      setPlannedRouteStops(stops)
    } catch (error) {
      console.error('Error retrieving stops:', error)
    }
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

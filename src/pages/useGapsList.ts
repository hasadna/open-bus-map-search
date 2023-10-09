import { useEffect, useState } from 'react'
import { Moment } from 'moment'
import { getGapsAsync } from '../api/gapsService'

import { HourlyData, byHourHandler, bySeverityHandler } from './components/utils'

export const useGapsList = (
  fromDate: Moment,
  toDate: Moment,
  operatorRef: string,
  lineRef: number,
  sortingMode: string,
) => {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])

  const sortData = (hourlyData: HourlyData[] = [], sortingMode: string) => {
    const orderedData = [...hourlyData]
    if (sortingMode === 'hour') {
      orderedData.sort(byHourHandler)
    } else if (sortingMode === 'severity') {
      orderedData.sort(bySeverityHandler)
    }
    return orderedData
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const gapsList = await getGapsAsync(fromDate, toDate, operatorRef, lineRef)

        // Convert gapsList data into hourly mapping as needed
        const hourlyMapping: Record<string, { planned_rides: number; actual_rides: number }> = {}

        for (const ride of gapsList) {
          if (ride.gtfsTime === null) {
            continue
          }
          const plannedHour = ride.gtfsTime.format('HH:mm')

          if (!hourlyMapping[plannedHour]) {
            hourlyMapping[plannedHour] = { planned_rides: 0, actual_rides: 0 }
          }

          hourlyMapping[plannedHour].planned_rides += 1
          if (ride.siriTime) {
            hourlyMapping[plannedHour].actual_rides += 1
          }
        }

        const result: HourlyData[] = Object.entries(hourlyMapping).map(([hour, data]) => ({
          planned_hour: hour,
          actual_rides: data.actual_rides,
          planned_rides: data.planned_rides,
        }))

        const orderedData = sortData(result, sortingMode)

        setHourlyData(orderedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [lineRef, operatorRef, fromDate, toDate, sortingMode])
  return hourlyData
}

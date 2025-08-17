import { RideExecutionPydanticModel } from '@hasadna/open-bus-api-client'
import { useEffect, useState } from 'react'
import { getGapsAsync } from '../../api/gapsService'
import { HourlyData, sortByMode } from '../components/utils'

type HourlyDataList = HourlyData[]
// Convert gapsList into HourlyDataList structure
export const convertGapsToHourlyStruct = (
  gapsList: RideExecutionPydanticModel[],
): HourlyDataList => {
  // Convert gapsList data to hourly mapping structure, where hour is a key
  const hourlyMapping: Record<string, { planned_rides: number; actual_rides: number }> = {}

  for (const ride of gapsList) {
    if (ride.plannedStartTime === undefined) {
      continue
    }
    const plannedHour = ride.plannedStartTime.toLocaleString('he', {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (!hourlyMapping[plannedHour]) {
      hourlyMapping[plannedHour] = { planned_rides: 0, actual_rides: 0 }
    }

    hourlyMapping[plannedHour].planned_rides += 1
    if (ride.actualStartTime) {
      hourlyMapping[plannedHour].actual_rides += 1
    }
  }
  // coverts hourlyMapping data to objects array where hour is a field
  return Object.entries(hourlyMapping).map(([hour, data]) => ({
    planned_hour: hour,
    actual_rides: data.actual_rides,
    planned_rides: data.planned_rides,
  }))
}

export const useGapsList = (
  fromDate: number,
  toDate: number,
  operatorRef: string,
  lineRef: number,
  sortingMode: string,
): HourlyData[] => {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gapsList = await getGapsAsync(fromDate, toDate, operatorRef, lineRef)
        const result = convertGapsToHourlyStruct(gapsList)
        setHourlyData(sortByMode(result, sortingMode))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()

    return () => {
      setHourlyData([])
    }
  }, [lineRef, operatorRef, fromDate, toDate, sortingMode])
  return hourlyData
}

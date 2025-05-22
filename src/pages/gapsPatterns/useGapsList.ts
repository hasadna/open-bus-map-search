import axios from 'axios'
import { useEffect, useState } from 'react'
import { getGapsAsync } from '../../api/gapsService'
import { HourlyData, sortByMode } from '../components/utils'
import { GapsList } from 'src/model/gaps'
import dayjs from 'src/pages/components/utils/dayjs'

type HourlyDataList = HourlyData[]
// Convert gapsList into HourlyDataList structure
export const convertGapsToHourlyStruct = (gapsList: GapsList): HourlyDataList => {
  // Convert gapsList data to hourly mapping structure, where hour is a key
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
  // coverts hourlyMapping data to objects array where hour is a field
  return Object.entries(hourlyMapping).map(([hour, data]) => ({
    planned_hour: hour,
    actual_rides: data.actual_rides,
    planned_rides: data.planned_rides,
  }))
}

export const useGapsList = (
  fromDate: dayjs.Dayjs,
  toDate: dayjs.Dayjs,
  operatorRef: string,
  lineRef: number,
  sortingMode: string,
): HourlyData[] => {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])

  useEffect(() => {
    const source = axios.CancelToken.source()
    const fetchData = async () => {
      try {
        const gapsList: GapsList = await getGapsAsync(
          fromDate,
          toDate,
          operatorRef,
          lineRef,
          source.token,
        )
        const result = convertGapsToHourlyStruct(gapsList)
        setHourlyData(sortByMode(result, sortingMode))
        return () => source.cancel()
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

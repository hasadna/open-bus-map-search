import { useEffect, useMemo, useState } from 'react'
import type { Dayjs } from 'src/dayjs'
import { Gap, getGapsAsync } from '../../api/gapsService'
import { HourlyData, sortByMode } from '../components/utils'

type HourlyDataList = HourlyData[]
// Convert gapsList into HourlyDataList structure
export const convertGapsToHourlyStruct = (gapsList: Gap[]): HourlyDataList => {
  // Convert gapsList data to hourly mapping structure, where hour is a key
  const hourlyMapping: Record<string, { planned_rides: number; actual_rides: number }> = {}

  for (const ride of gapsList) {
    if (ride.plannedStartTime === undefined) {
      continue
    }
    const plannedHour = ride.plannedStartTime.format('HH:mm')

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
  fromDate: Dayjs,
  toDate: Dayjs,
  operatorRef: string,
  lineRef: number,
  sortingMode: string,
): HourlyData[] => {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])

  // Depend on the instants, not the Dayjs identities — an inline-constructed
  // fromDate/toDate would otherwise re-run the effect (and refetch) every render.
  const fromKey = fromDate.valueOf()
  const toKey = toDate.valueOf()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gapsList = await getGapsAsync(fromDate, toDate, operatorRef, lineRef)
        setHourlyData(convertGapsToHourlyStruct(gapsList))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()

    return () => {
      setHourlyData([])
    }
    // sortingMode is deliberately NOT a fetch dep — it only reorders rows we
    // already have (applied at render below), so switching it must never
    // trigger a refetch (or flash the skeleton via the cleanup above).
  }, [lineRef, operatorRef, fromKey, toKey])

  // Sort at render time: a pure client-side reorder (sortByMode → toSorted),
  // recomputed only when the fetched data or the chosen mode changes.
  return useMemo(() => sortByMode(hourlyData, sortingMode), [hourlyData, sortingMode])
}

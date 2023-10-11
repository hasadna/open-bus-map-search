import { GapsList } from 'src/model/gaps'
export interface HourlyData {
  planned_hour: string
  actual_rides: number
  planned_rides: number
}

export const byHourHandler = (a: HourlyData, b: HourlyData) =>
  a.planned_hour.localeCompare(b.planned_hour)

export const bySeverityHandler = (a: HourlyData, b: HourlyData) => {
  const missesA = a.planned_rides - a.actual_rides
  const missesB = b.planned_rides - b.actual_rides
  const percentageMissesA = (missesA / a.planned_rides) * 100
  const percentageMissesB = (missesB / b.planned_rides) * 100

  if (percentageMissesA !== percentageMissesB) {
    return percentageMissesB - percentageMissesA
  }
  if (missesA !== missesB) {
    return missesB - missesA
  }
  return b.planned_rides - a.planned_rides
}

export const sortByMode = (hourlyData: HourlyData[] = [], sortingMode: string) => {
  return hourlyData.toSorted(sortingMode === 'hour' ? byHourHandler : bySeverityHandler)
}

export const mapColorByExecution = (planned: number, actual: number) => {
  const misses = planned - actual
  const percentageMisses = (misses / planned) * 100

  if (percentageMisses <= 5) {
    return 'green'
  } else if (percentageMisses <= 50) {
    return 'orange'
  } else {
    return 'red'
  }
}

export type HourlyDataList = HourlyData[]
 // Convert gapsList into HourlyDataList structure
export const processData = (gapsList: GapsList): HourlyDataList => {
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

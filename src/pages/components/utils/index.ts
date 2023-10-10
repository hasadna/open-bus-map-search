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

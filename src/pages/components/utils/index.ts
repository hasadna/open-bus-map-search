export interface HourlyData {
  planned_hour: string
  actual_rides: number
  planned_rides: number
}

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

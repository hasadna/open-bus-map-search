import { GroupByRes } from 'src/api/groupByService'

export type RidesDataStatus = 'loading' | 'error' | 'noData' | 'noActualRides' | 'ok'

export function ridesDataStatus(
  rides: GroupByRes[],
  isLoading: boolean,
  error: unknown,
): RidesDataStatus {
  if (isLoading) return 'loading'
  if (error) return 'error'
  if (rides.length === 0) return 'noData'
  if (rides.every((ride) => ride.totalActualRides === 0)) return 'noActualRides'
  return 'ok'
}

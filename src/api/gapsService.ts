import { apiDateFromString, serializeInstant } from 'src/dayjs'
import { USER_CASE_API } from './apiConfig'

export type Gap = {
  // Instants at rest: ISO-8601 carrying the Israel offset. parseInstant before comparing.
  plannedStartTime?: string
  actualStartTime?: string
  gtfsRideId?: number
}

export const getGapsAsync = (
  from: string,
  to: string,
  operatorId: string,
  lineRef: number,
  limit = 10000,
) => {
  return USER_CASE_API.ridesExecutionListGet({
    dateFrom: apiDateFromString(from),
    dateTo: apiDateFromString(to),
    limit,
    lineRef,
    operatorRef: parseInt(operatorId),
  }).then((gaps) =>
    gaps.map((gap) => ({
      actualStartTime: gap.actualStartTime ? serializeInstant(gap.actualStartTime) : undefined,
      plannedStartTime: gap.plannedStartTime ? serializeInstant(gap.plannedStartTime) : undefined,
      gtfsRideId: gap.gtfsRideId,
    })),
  )
}

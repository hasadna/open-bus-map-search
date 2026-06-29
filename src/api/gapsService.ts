import dayjs, { parseInstant, toApiDate } from 'src/dayjs'
import { USER_CASE_API } from './apiConfig'

export type Gap = {
  plannedStartTime?: dayjs.Dayjs
  actualStartTime?: dayjs.Dayjs
  gtfsRideId?: number
}

export const getGapsAsync = (
  from: dayjs.Dayjs,
  to: dayjs.Dayjs,
  operatorId: string,
  lineRef: number,
  limit = 10000,
) => {
  return USER_CASE_API.ridesExecutionListGet({
    dateFrom: toApiDate(from),
    dateTo: toApiDate(to),
    limit,
    lineRef,
    operatorRef: parseInt(operatorId),
  }).then((gaps) =>
    gaps.map((gap) => {
      return {
        actualStartTime: parseInstant(gap.actualStartTime),
        plannedStartTime: parseInstant(gap.plannedStartTime),
        gtfsRideId: gap.gtfsRideId,
      }
    }),
  )
}

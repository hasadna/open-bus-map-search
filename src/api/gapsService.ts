import { USER_CASE_API } from './apiConfig'
import dayjs from 'src/dayjs'

export function parseTime(time?: dayjs.ConfigType): Date | undefined {
  if (!time) return undefined
  return dayjs(time).utcOffset(0, true).tz('Asia/Jerusalem').toDate()
}

export const getGapsAsync = (
  fromTimestamp: number,
  toTimestamp: number,
  operatorId: string,
  lineRef: number,
  limit = 10000,
) => {
  return USER_CASE_API.ridesExecutionListGet({
    dateFrom: new Date(fromTimestamp),
    dateTo: new Date(toTimestamp),
    limit,
    lineRef,
    operatorRef: operatorId ? parseInt(operatorId) : undefined,
  }).then((gaps) =>
    gaps.map((gap) => {
      if (gap.actualStartTime) {
        gap.actualStartTime = parseTime(gap.actualStartTime)
      }
      if (gap.plannedStartTime) {
        gap.plannedStartTime = parseTime(gap.plannedStartTime)
      }
      return gap
    }),
  )
}

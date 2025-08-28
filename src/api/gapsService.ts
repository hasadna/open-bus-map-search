import dayjs from 'src/dayjs'
import { USER_CASE_API } from './apiConfig'

export type Gap = {
  plannedStartTime?: dayjs.Dayjs
  actualStartTime?: dayjs.Dayjs
  gtfsRideId?: number
}

export function parseTime(time?: dayjs.ConfigType) {
  if (!time) return undefined
  const utcDayjs = dayjs.utc(time).utcOffset(0, true).tz('Asia/Jerusalem')
  if (!utcDayjs.isValid()) return undefined
  return utcDayjs
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
      return {
        actualStartTime: parseTime(gap.actualStartTime),
        plannedStartTime: parseTime(gap.plannedStartTime),
        gtfsRideId: gap.gtfsRideId,
      } as Gap
    }),
  )
}

import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { USER_CASE_API } from './apiConfig'

export type Gap = {
  plannedStartTime?: dayjs.Dayjs
  actualStartTime?: dayjs.Dayjs
  gtfsRideId?: number
}

// What actually lives in the (localStorage-persisted) React Query cache: JSON-native
// only. dayjs times are held as ISO strings and revived at the UI edge (GapsTable),
// so a rehydrated cache can never hand the table a bare string to call .format() on.
export type SerializedGap = {
  plannedStartTime?: string
  actualStartTime?: string
  gtfsRideId?: number
}

export const serializeGap = (gap: Gap): SerializedGap => ({
  gtfsRideId: gap.gtfsRideId,
  plannedStartTime: gap.plannedStartTime?.toISOString(),
  actualStartTime: gap.actualStartTime?.toISOString(),
})

export const reviveGap = (gap: SerializedGap): Gap => ({
  gtfsRideId: gap.gtfsRideId,
  plannedStartTime: gap.plannedStartTime ? toIsraelTimezone(gap.plannedStartTime) : undefined,
  actualStartTime: gap.actualStartTime ? toIsraelTimezone(gap.actualStartTime) : undefined,
})

export function parseTime(time?: dayjs.ConfigType) {
  if (!time) return undefined
  const utcDayjs = dayjs.utc(time).utcOffset(0, true).tz(ISRAEL_TIMEZONE)
  if (!utcDayjs.isValid()) return undefined
  return utcDayjs
}

export const getGapsAsync = (
  from: dayjs.Dayjs,
  to: dayjs.Dayjs,
  operatorId: string,
  lineRef: number,
  limit = 10000,
) => {
  return USER_CASE_API.ridesExecutionListGet({
    dateFrom: from.toDate(),
    dateTo: to.toDate(),
    limit,
    lineRef,
    operatorRef: parseInt(operatorId),
  }).then((gaps) =>
    gaps.map((gap) => {
      return {
        actualStartTime: parseTime(gap.actualStartTime),
        plannedStartTime: parseTime(gap.plannedStartTime),
        gtfsRideId: gap.gtfsRideId,
      }
    }),
  )
}

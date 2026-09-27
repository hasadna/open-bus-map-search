import dayjs, { ISRAEL_TIMEZONE, israelDayBounds, toIsraelTimezone } from 'src/dayjs'
import { type CivilDate, civilDateToDayjs } from 'src/model/time/civilDate'
import { SIRI_API, USER_CASE_API } from './apiConfig'

export type Gap = {
  plannedStartTime?: dayjs.Dayjs
  actualStartTime?: dayjs.Dayjs
  gtfsRideId?: number
  vehicleRefs?: string[]
}

// What actually lives in the persisted React Query cache. dayjs times are held as ISO
// strings and revived at the UI edge (GapsTable) — persistence is a structured clone,
// which would otherwise hand the table a Dayjs-shaped object with no .format() on it.
export type SerializedGap = {
  plannedStartTime?: string
  actualStartTime?: string
  gtfsRideId?: number
  vehicleRefs?: string[]
}

export const serializeGap = (gap: Gap): SerializedGap => ({
  gtfsRideId: gap.gtfsRideId,
  plannedStartTime: gap.plannedStartTime?.toISOString(),
  actualStartTime: gap.actualStartTime?.toISOString(),
  vehicleRefs: gap.vehicleRefs,
})

export const reviveGap = (gap: SerializedGap): Gap => ({
  gtfsRideId: gap.gtfsRideId,
  plannedStartTime: gap.plannedStartTime ? toIsraelTimezone(gap.plannedStartTime) : undefined,
  actualStartTime: gap.actualStartTime ? toIsraelTimezone(gap.actualStartTime) : undefined,
  vehicleRefs: gap.vehicleRefs,
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

const SIRI_RIDES_LIMIT = 500

/**
 * Plates of the day's rides, keyed by departure instant. The key is
 * `siri_ride.scheduled_start_time` — the very column /rides_execution/list reports as
 * `actual_start_time` — so the lookup is exact rather than a nearest-time guess.
 * A departure can hold more than one plate: two buses sometimes run the same one.
 */
const getPlatesByDepartureAsync = async (
  date: CivilDate,
  operatorId: string,
  lineRef: number,
): Promise<Map<number, string[]>> => {
  const { start, end } = israelDayBounds(date)
  const rides = await SIRI_API.siriRidesListGet({
    siriRouteLineRefs: lineRef.toString(),
    siriRouteOperatorRefs: operatorId,
    scheduledStartTimeFrom: start.toDate(),
    // ...To is inclusive server-side, so step back off the exclusive day end.
    scheduledStartTimeTo: end.subtract(1, 'millisecond').toDate(),
    limit: SIRI_RIDES_LIMIT,
  })

  const plates = new Map<number, string[]>()
  for (const ride of rides) {
    if (!ride.scheduledStartTime || !ride.vehicleRef) continue
    const departure = ride.scheduledStartTime.getTime()
    plates.set(departure, [...(plates.get(departure) ?? []), ride.vehicleRef])
  }
  return plates
}

/**
 * One day's rides, each carrying the plate of the bus that ran it. Single-day on
 * purpose: the range form above stays plate-free, since a multi-day SIRI fetch would
 * run past the row limit for data that only the per-day gaps grid renders.
 */
export const getGapsWithVehiclesAsync = async (
  date: CivilDate,
  operatorId: string,
  lineRef: number,
): Promise<Gap[]> => {
  const day = civilDateToDayjs(date)
  const [gaps, platesByDeparture] = await Promise.all([
    getGapsAsync(day, day, operatorId, lineRef),
    // The plates ride along with the grid rather than gating it: if SIRI is
    // unreachable the table still renders, just without them.
    getPlatesByDepartureAsync(date, operatorId, lineRef).catch(() => new Map<number, string[]>()),
  ])

  return gaps.map((gap) => ({
    ...gap,
    vehicleRefs: gap.actualStartTime
      ? platesByDeparture.get(gap.actualStartTime.valueOf())
      : undefined,
  }))
}

import dayjs from 'src/dayjs'

export type StartTimeToken = {
  scheduledTime: string
  vehicleRef?: string
  lineRef?: string
}

/** Service-day token "HH:mm" for an instant, relative to the service-day start.
 *  Hour can exceed 23 for past-midnight rides (e.g. "25:30"). Inverse of the
 *  >=24 hours accepted by normalizeScheduledTime below.
 *
 *  Computed from WALL-CLOCK parts (calendar-day offset × 24 + local hour), not
 *  from elapsed-minutes diff, so it is DST-stable: a 01:30 next-day ride is
 *  always "25:30", and reconstructing serviceDayStart.hour(h) lands on the right
 *  instant even on the fall-back night. (diff('day') can't be used for the offset
 *  — it floors absolute elapsed time, so a 23-hour spring-forward day would
 *  wrongly yield 0. The window is <=28h, so the offset is only ever 0 or 1.) */
export function formatServiceDayTime(instant: dayjs.Dayjs, serviceDayStart: dayjs.Dayjs): string {
  const dayOffset = instant.isSame(serviceDayStart, 'day') ? 0 : 1
  const h = dayOffset * 24 + instant.hour()
  const m = instant.minute()
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function normalizeScheduledTime(raw?: string): string | undefined {
  if (!raw) return undefined

  const normalized = raw.replace(/-/g, ':')
  const match = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return undefined

  const hour = Number(match[1])
  const minute = Number(match[2])
  // Service-day tokens use extended hours (>=24) for rides past midnight, so the
  // usual 0-23 range does not apply. The service window ends at 28:00 (04:00 next
  // day, inclusive), so 28 is the highest valid hour. Tokens are wall-clock based
  // (see formatServiceDayTime), so this bound is exact — no DST slack needed.
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 28 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export function parseStartTimeToken(token?: string): StartTimeToken | undefined {
  if (!token) return undefined

  const [rawScheduledTime, vehicleRef, lineRef] = token.split('|')
  const scheduledTime = normalizeScheduledTime(rawScheduledTime)
  if (!scheduledTime) return undefined

  return {
    scheduledTime,
    vehicleRef: vehicleRef || undefined,
    lineRef: lineRef || undefined,
  }
}

export function normalizeStartTimeToken(token?: string): string | undefined {
  const parsed = parseStartTimeToken(token)
  if (!parsed) return undefined

  const { scheduledTime, vehicleRef, lineRef } = parsed
  if (vehicleRef && lineRef) return `${scheduledTime}|${vehicleRef}|${lineRef}`
  if (vehicleRef) return `${scheduledTime}|${vehicleRef}`
  return scheduledTime
}

export function formatStartTimeForQuery(time?: string): string {
  return normalizeScheduledTime(time)?.replace(/:/g, '-') || ''
}

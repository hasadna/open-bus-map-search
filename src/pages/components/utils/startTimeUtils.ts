import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'

/** The service-day window for a YYYY-MM-DD date: 00:00 Israel time through 04:00 the
 *  next morning. The late-night tail (00:00–04:00 of the following calendar day)
 *  belongs to this service day. `start` is a wall-clock midnight so it is DST-stable.
 *
 *  Single source of truth for the window — the gaps fetch, the single-line/lineProfile
 *  ride list, and the gaps table's token formatting all derive their bounds from here,
 *  so they can't drift apart. */
export function serviceDayBounds(date: string): { start: dayjs.Dayjs; end: dayjs.Dayjs } {
  const start = dayjs.tz(date, ISRAEL_TIMEZONE).startOf('day')
  const end = start.add(1, 'day').startOf('day').add(4, 'hours')
  return { start, end }
}

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

/** Render a service-day token "HH:mm" (hour may be >=24) for HUMANS.
 *  A past-midnight departure like "24:10" becomes the wall-clock "00:10" with
 *  nextDay=true, so the UI can show the real clock time plus a "next night"
 *  marker instead of the confusing extended hour. The extended token is still
 *  what gets stored in the URL / passed around — this is display-only. */
export function serviceDayTokenToDisplay(token: string): { time: string; nextDay: boolean } {
  const [hourPart, minutePart] = token.split(':')
  const hour = Number(hourPart)
  const minute = Number(minutePart)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return { time: token, nextDay: false }
  const nextDay = hour >= 24
  const wallHour = hour % 24
  return {
    time: `${wallHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    nextDay,
  }
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

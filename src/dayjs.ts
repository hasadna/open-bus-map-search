import dayjs from 'dayjs'
import 'dayjs/locale/he.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import minMax from 'dayjs/plugin/minMax.js'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

// Extend dayjs with all required plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(minMax)
dayjs.extend(isoWeek)

// Set default timezone
export const ISRAEL_TIMEZONE = 'Asia/Jerusalem'
dayjs.tz.setDefault(ISRAEL_TIMEZONE)

export const toIsraelTimezone = (value?: dayjs.ConfigType) => dayjs(value).tz(ISRAEL_TIMEZONE)

/** Build a Date anchored at 12:00 UTC for the given calendar date string ("YYYY-MM-DD").
 *  GTFS list endpoints serialize `date_from`/`date_to` via `.toISOString().substring(0, 10)`
 *  (a UTC date). A Date at Israel midnight is 21:00Z of the *previous* calendar day, so it
 *  would serialize to the wrong (previous) GTFS date — dropping every route that doesn't run
 *  that previous day. Anchoring to UTC noon makes the serialized date always correct. */
export const utcNoonForDateStr = (dateStr: string): Date => new Date(`${dateStr}T12:00:00Z`)

/** The Israel-local calendar day for a "YYYY-MM-DD" date: 00:00 through 00:00 the
 *  next morning, `end` exclusive. Both ends are wall-clock midnights, so the window
 *  is 23h or 25h on the two DST-transition days rather than a fixed 24h offset.
 *
 *  Single source of truth for the day window — the gaps fetch, the single-line ride
 *  list and the vehicle page all derive their bounds from here so they can't drift. */
export const israelDayBounds = (dateStr: string): { start: dayjs.Dayjs; end: dayjs.Dayjs } => {
  const start = dayjs.tz(dateStr, ISRAEL_TIMEZONE).startOf('day')
  return { start, end: start.add(1, 'day').startOf('day') }
}

/** Parse an Israel-local datetime string from untrusted input (e.g. a shared-URL
 *  param) into a Dayjs, or null if unparsable — dayjs.tz throws on bad input
 *  instead of returning an invalid instance. */
export const parseIsraelLocalDatetime = (value: string): dayjs.Dayjs | null => {
  try {
    const parsed = dayjs.tz(value, ISRAEL_TIMEZONE)
    return parsed.isValid() ? parsed : null
  } catch {
    return null
  }
}

// Set default locale
dayjs.locale('he')

export default dayjs

export type Dayjs = dayjs.Dayjs

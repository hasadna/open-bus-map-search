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
 *  next morning, `end` exclusive. The window is 23h or 25h on Israel's two
 *  DST-transition days, not a fixed 24h.
 *
 *  Each bound is built from its own date string. Do NOT "tidy" this into
 *  `dayjs.tz(dateStr, tz).startOf('day').add(1, 'day')`: `dayjs.tz()` already
 *  returns midnight in the zone, and chaining `startOf`/`add` re-resolves the offset
 *  against the *browser's* zone — which picks the wrong side of a DST transition for
 *  anyone not browsing from Israel, moving the bound an hour on those dates.
 *  Next-date arithmetic goes through `dayjs.utc` for the same reason: plain `dayjs()`
 *  would trip over a transition in the browser's own zone.
 *
 *  For endpoints that take INSTANTS (the single-line ride list, the vehicle page).
 *  Date-granular endpoints take `utcNoonForDateStr` instead: they serialize a Date to
 *  its UTC calendar day, and `start` here is 22:00 UTC the evening before — which
 *  would ask for the previous day as well. */
export const israelDayBounds = (dateStr: string): { start: dayjs.Dayjs; end: dayjs.Dayjs } => ({
  start: dayjs.tz(dateStr, ISRAEL_TIMEZONE),
  end: dayjs.tz(dayjs.utc(dateStr).add(1, 'day').format('YYYY-MM-DD'), ISRAEL_TIMEZONE),
})

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

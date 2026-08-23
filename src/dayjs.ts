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

/** The Israel-local calendar day for a "YYYY-MM-DD" date, `end` exclusive — 23h or 25h
 *  on the two DST-transition days, not a fixed 24h. For endpoints taking instants;
 *  date-granular ones take `civilDateToApiDate` (src/model/time/civilDate).
 *
 *  Each bound is built from its own date string on purpose. Do NOT "tidy" this into
 *  `dayjs.tz(dateStr, tz).startOf('day').add(1, 'day')` — `startOf`/`add`/plain `dayjs()`
 *  re-resolve the offset against the *browser's* zone, landing on the wrong side of a
 *  transition for anyone not browsing from Israel. */
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

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

/** Convert a Dayjs to the `Date` expected by `format: date` (calendar-day) API params.
 *
 *  The generated API client serializes date-only params with
 *  `value.toISOString().substring(0, 10)`, i.e. it reads the calendar day in **UTC**.
 *  A Date at Israel midnight is 21:00/22:00 UTC of the *previous* day, so the naive
 *  `dayjs.toDate()` truncates to the wrong date. We instead anchor the Israeli calendar
 *  day at **noon UTC**, where the UTC and Israel calendar days always agree — so the
 *  client's UTC truncation yields the correct day on any runtime timezone (browser, SSR,
 *  CI/Jest defaulting to UTC).
 *
 *  Use for every `format: date` param. NEVER for `format: date-time` (real instants):
 *  this throws away the time-of-day. */
export function toApiDate(value: dayjs.Dayjs): Date {
  return new Date(`${toIsraelTimezone(value).format('YYYY-MM-DD')}T12:00:00Z`)
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

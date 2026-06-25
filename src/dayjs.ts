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

/**
 * Build the `Date` to hand the GTFS client for a `date_from`/`date_to` (service-day)
 * filter. The generated client serializes those params as `Date.toISOString().slice(0, 10)`
 * — i.e. the **UTC** calendar date. Israel is always east of UTC, so an Israel-midnight
 * `Date` (e.g. `dayjs.tz(d, 'Asia/Jerusalem')`) is `21:00`/`22:00Z` the *previous* day and
 * would query one day early year-round. Anchoring at noon UTC of the Israeli calendar day
 * keeps the serialized date correct regardless of the offset.
 */
export const toGtfsServiceDate = (value?: dayjs.ConfigType): Date =>
  new Date(`${toIsraelTimezone(value).format('YYYY-MM-DD')}T12:00:00Z`)

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

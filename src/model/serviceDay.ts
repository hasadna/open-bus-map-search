/**
 * Service Day Handling for Israeli Public Transit
 *
 * In the GTFS (General Transit Feed Specification) standard, a "service day"
 * does not end at midnight. Instead, it extends past midnight to cover
 * late-night routes that depart before midnight but arrive after.
 *
 * The GTFS spec represents post-midnight times using values > 24:00:00.
 * For example, 1:30 AM on a service day that started the previous calendar
 * day is represented as 25:30:00.
 *
 * Israeli bus routes commonly run past midnight. A bus departing at 23:30
 * may complete its route at 00:30 the next calendar day. Without extending
 * the query window past midnight, these rides appear to vanish at midnight.
 *
 * Industry standard implementations:
 *   - OpenTripPlanner: uses a 3-day query window
 *   - Transitland API: automatically includes overnight trips
 *   - This app: extends the service day to 4:00 AM (28 hours)
 *
 * Reference: https://gtfs.org/documentation/schedule/reference/
 * See also: stop_times.txt departure_time field documentation
 */
import dayjs from 'src/dayjs'

/**
 * The hour at which a service day ends (on the next calendar day).
 * 4 AM is a common convention — most transit agencies do not schedule
 * new service departures between ~2 AM and ~5 AM.
 */
export const SERVICE_DAY_END_HOUR = 4

/**
 * Total hours in a service day (24 + SERVICE_DAY_END_HOUR).
 */
export const SERVICE_DAY_HOURS = 24 + SERVICE_DAY_END_HOUR

/**
 * Returns the service day boundaries for a given timestamp.
 *
 * A service day starts at midnight (00:00) of the selected date
 * and extends to SERVICE_DAY_END_HOUR (04:00) of the next calendar day.
 *
 * @example
 * // For January 15th:
 * // start = Jan 15 00:00
 * // end   = Jan 16 04:00
 * const { start, end } = getServiceDayBounds(dayjs('2024-01-15T14:00:00'))
 */
export function getServiceDayBounds(timestamp: dayjs.Dayjs) {
  const start = timestamp.startOf('day')
  const end = start.add(SERVICE_DAY_HOURS, 'hour')
  return { start, end }
}

/**
 * Converts a post-midnight hour (0-3) to its service day equivalent (24-27).
 * Hours 4-23 are returned unchanged.
 *
 * This is useful for sorting and displaying times in service day order,
 * where 00:30 after midnight should appear after 23:30, not before 01:00.
 *
 * @example
 * toServiceDayHour(23) // => 23
 * toServiceDayHour(0)  // => 24
 * toServiceDayHour(1)  // => 25
 * toServiceDayHour(3)  // => 27
 * toServiceDayHour(4)  // => 4
 */
export function toServiceDayHour(hour: number): number {
  return hour < SERVICE_DAY_END_HOUR ? hour + 24 : hour
}

/**
 * Formats a service day hour for display.
 * Hours 24-27 are displayed as "00:xx-03:xx (+1)" to indicate next day.
 * Regular hours are displayed normally.
 *
 * @example
 * formatServiceDayHour(23)  // => "23:00"
 * formatServiceDayHour(24)  // => "00:00 (+1)"
 * formatServiceDayHour(25)  // => "01:00 (+1)"
 */
export function formatServiceDayHour(serviceDayHour: number): string {
  if (serviceDayHour >= 24) {
    const displayHour = serviceDayHour - 24
    return `${String(displayHour).padStart(2, '0')}:00 (+1)`
  }
  return `${String(serviceDayHour).padStart(2, '0')}:00`
}

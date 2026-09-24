import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'

/**
 * The single date the whole fixture/test world is pinned to — an **Israel calendar day**.
 * Everything derives from it: the emulated clock (`getPastDate` in tests/utils), every
 * builder's default dates, and the request URLs the tests assert.
 *
 * Kept a plain `YYYY-MM-DD` string (the Israel calendar day), NOT a `Date`, so there is no
 * UTC/local ambiguity at the source — anything needing an instant builds one explicitly
 * (and in Israel time where the day boundary matters). This is the one knob: change it and
 * the clock, the builders, and every derived request URL move together automatically. The
 * only thing that must then be re-captured is the anchor literals in date.spec.ts — a
 * deliberate, reviewed event, which that spec's first assertion flags.
 */
export const FIXTURE_DATE = '2024-02-12'

/**
 * The instant the emulated clock is set to (`getPastDate` in tests/utils). 15:00 UTC = 17:00
 * Israel: mid-day in both zones, so the UTC and Israel calendar dates coincide on FIXTURE_DATE.
 * Anything the app derives from `Date.now()` — e.g. the agency list's look-back dates — is
 * derived from here, so it moves with the knob too.
 */
export const FIXTURE_CLOCK = `${FIXTURE_DATE}T15:00:00.000Z`

/**
 * The UTC calendar date `days` before the emulated clock, in the form the generated client
 * serializes a Date into a date-only query param (`toISOString()[0:10]`).
 */
export const utcDayBeforeClock = (days: number): string =>
  new Date(new Date(FIXTURE_CLOCK).getTime() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .substring(0, 10)

/**
 * The dates the vehicle page's stride requests carry, DERIVED from FIXTURE_DATE so it stays
 * the one knob — change the date and the golden URLs move with it. Where the app's rule is
 * real arithmetic (the siri day window) it is re-implemented here with dayjs primitives ON
 * PURPOSE and must NOT import the app's own israelDayBounds/serializer: the stub URL and
 * the app's real request have to come from INDEPENDENT producers, or full-URL matching would
 * compare a function against itself and be blind to exactly the date drift it exists to catch.
 * Where the app's rule leaves the date alone there is no helper at all — the request URL uses
 * FIXTURE_DATE directly, rather than an identity function dressed up as a derivation. Outputs
 * are anchored to captured reference values in tests/fixtures/date.spec.ts, and — live, against
 * the running app — by tests/vehicle.spec.ts, where any wrong date surfaces as an unmocked
 * request. That live check, not the arithmetic here, is the real guard.
 */

// The Israel calendar day: midnight to midnight, tz-aware so it is DST-safe (a summer date
// starts at 21:00Z, not 22:00Z) and so the end is the NEXT calendar date's midnight rather
// than start+24h. Mirrors israelDayBounds() in src/dayjs.ts, re-derived here rather than
// imported.
const israelDay = (date: string) => {
  const start = dayjs.tz(date, ISRAEL_TIMEZONE)
  const end = dayjs.tz(dayjs.utc(date).add(1, 'day').format('YYYY-MM-DD'), ISRAEL_TIMEZONE)
  return { start, end }
}

/** siri `scheduled_start_time_from`/`_to` — the Israel day as the wire ISO instants the
 *  vehicle page sends (e.g. 2024-02-11T22:00:00.000Z … 2024-02-12T21:59:59.999Z). The `to`
 *  stops a millisecond short of the next midnight because the server treats it as inclusive
 *  (src/pages/vehicle/index.tsx). */
export const siriWindow = (date: string = FIXTURE_DATE) => {
  const { start, end } = israelDay(date)
  return {
    from: start.toDate().toISOString(),
    to: end.subtract(1, 'millisecond').toDate().toISOString(),
  }
}

/** A wall-clock time on the fixture date, as a wire instant — for siri ride BODY
 *  `scheduledStartTime` values. Deriving these (not literal Dates) keeps the ride bodies
 *  inside the window when FIXTURE_DATE changes, so the render assertions stay valid. */
export const israelTime = (hour: number, minute = 0): Date =>
  dayjs.tz(FIXTURE_DATE, ISRAEL_TIMEZONE).hour(hour).minute(minute).toDate()

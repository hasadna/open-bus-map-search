import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'

/**
 * The single date the whole fixture/test world is pinned to — an **Israel service-day**.
 * Everything derives from it: the emulated clock (`getPastDate` in tests/utils), every
 * builder's default dates, and the request URLs the tests assert.
 *
 * Kept a plain `YYYY-MM-DD` string (the Israel service day), NOT a `Date`, so there is no
 * UTC/local ambiguity at the source — anything needing an instant builds one explicitly
 * (and in Israel time where the service-day matters). This is the one knob: change it and
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
 * real arithmetic (the siri service-day window) it is re-implemented here with dayjs primitives
 * ON PURPOSE and must NOT import the app's own serviceDayBounds/serializer: the stub URL and
 * the app's real request have to come from INDEPENDENT producers, or full-URL matching would
 * compare a function against itself and be blind to exactly the date drift it exists to catch.
 * Where the app's rule leaves the date alone there is no helper at all — the request URL uses
 * FIXTURE_DATE directly, rather than an identity function dressed up as a derivation. Outputs
 * are anchored to captured reference values in tests/fixtures/date.spec.ts, and — live, against
 * the running app — by tests/vehicle.spec.ts, where any wrong date surfaces as an unmocked
 * request. That live check, not the arithmetic here, is the real guard.
 */

// Service day = 00:00 Israel time through 04:00 the next morning, tz-aware so it is DST-safe
// (a summer date resolves to 21:00Z, not 22:00Z). Mirrors serviceDayBounds() in
// src/pages/components/utils/startTimeUtils.ts, re-derived here rather than imported.
const serviceDay = (date: string) => {
  const start = dayjs.tz(date, ISRAEL_TIMEZONE).startOf('day')
  const end = start.add(1, 'day').startOf('day').add(4, 'hours')
  return { start, end }
}

/** siri `scheduled_start_time_from`/`_to` — the service-day window as the wire ISO instants
 *  the vehicle page sends (e.g. 2024-02-11T22:00:00.000Z … 2024-02-13T02:00:00.000Z). */
export const siriWindow = (date: string = FIXTURE_DATE) => {
  const { start, end } = serviceDay(date)
  return { from: start.toDate().toISOString(), to: end.toDate().toISOString() }
}

/** A wall-clock time on the fixture service day, as a wire instant — for siri ride BODY
 *  `scheduledStartTime` values. `nextDay` places it in the post-midnight tail (00:00–04:00)
 *  that still belongs to this service day. Deriving these (not literal Dates) keeps the ride
 *  bodies inside the window when FIXTURE_DATE changes, so the render assertions stay valid. */
export const israelServiceTime = (
  hour: number,
  minute = 0,
  { nextDay = false }: { nextDay?: boolean } = {},
): Date => {
  const base = dayjs.tz(FIXTURE_DATE, ISRAEL_TIMEZONE).startOf('day')
  return (nextDay ? base.add(1, 'day') : base).hour(hour).minute(minute).toDate()
}

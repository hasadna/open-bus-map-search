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
 * The dates the vehicle page's stride requests carry, DERIVED from FIXTURE_DATE so it stays
 * the one knob — change the date and the golden URLs move with it. These re-implement the
 * app's window rule with dayjs primitives ON PURPOSE: they must NOT import the app's own
 * serviceDayBounds/serializer. The stub URL and the app's real request have to come from
 * INDEPENDENT producers, or full-URL matching would compare a function against itself and be
 * blind to exactly the date drift it exists to catch. The current outputs are anchored to
 * captured reference values in tests/fixtures/date.spec.ts, and — live, against the running app —
 * by tests/vehicle.spec.ts (a wrong derivation there surfaces as an unmocked request).
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

/** gtfs `date_from`/`date_to`. The vehicle page hands the service-day START Date to the gtfs
 *  client, which serializes it as a UTC date (toISOString[0:10]); Israel-midnight is 22:00Z
 *  the PREVIOUS calendar day, so this is FIXTURE_DATE minus one (2024-02-11 for 2024-02-12).
 *  Reproduced faithfully: the vehicle page, unlike getServiceDayRoutes, does not correct this
 *  with utcNoonForDateStr (see src/dayjs.ts), so the request really does target the prior GTFS
 *  day — the fixture pins what the app actually asks for, not what it arguably should. */
export const gtfsDay = (date: string = FIXTURE_DATE): string =>
  serviceDay(date).start.toDate().toISOString().substring(0, 10)

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

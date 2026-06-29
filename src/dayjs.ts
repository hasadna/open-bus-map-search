import dayjs from 'dayjs'
import 'dayjs/locale/he.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import minMax from 'dayjs/plugin/minMax.js'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

// ── Setup ───────────────────────────────────────────────────────────────────

// Extend dayjs with all required plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(minMax)
dayjs.extend(isoWeek)

// Set default timezone
export const ISRAEL_TIMEZONE = 'Asia/Jerusalem'
dayjs.tz.setDefault(ISRAEL_TIMEZONE)

export const toIsraelTimezone = (value?: dayjs.ConfigType) => dayjs(value).tz(ISRAEL_TIMEZONE)

// ── Civil calendar days (Israel) ────────────────────────────────────────────
//
// A civil date lives at rest as a "YYYY-MM-DD" string (global state, URL, props).
// It is zone-less and unambiguous. A Dayjs/Date is materialized only transiently —
// at the MUI picker value, calendar math, and toApiDate boundaries — never stored
// back. Equality is therefore `===` and chronological compare is lexicographic.

/** Today as an Israel civil-day string "YYYY-MM-DD". The single helper that reads the
 *  system clock and projects it to Asia/Jerusalem. Call it at the use-site (render,
 *  query, clamp) — never capture it in a module-level const, which freezes for the
 *  whole session and goes stale across midnight. */
export const todayIsraelDate = (): string => toIsraelTimezone(dayjs()).format('YYYY-MM-DD')

/** True if the value is a readable "YYYY-MM-DD" calendar date (the at-rest form of
 *  civil dates in global state and the URL). Used to drop corrupt dates from shared
 *  URLs or stale session storage instead of letting them break every date consumer.
 *  The round-trip comparison rejects overflow dates like "2026-02-30", which dayjs
 *  silently normalizes to a different day instead of marking invalid. */
export const isValidSearchDate = (date: unknown): date is string =>
  typeof date === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  dayjs(date).format('YYYY-MM-DD') === date

/** Parse a "YYYY-MM-DD" civil-day string into an ephemeral Dayjs, anchored at Israel
 *  noon so the calendar day survives a later .toDate()/UTC truncation in any runtime
 *  zone. Falls back to today on malformed input — callers receive already-validated
 *  global-state / URL strings (isValidSearchDate runs at the URL boundary), so the
 *  fallback is defensive, not a real code path. Materialize only at the boundaries that
 *  need a Dayjs (MUI picker value, date math, toApiDate); never store it back. */
export const parseIsraelDate = (date: string): dayjs.Dayjs =>
  dayjs.tz(`${isValidSearchDate(date) ? date : todayIsraelDate()}T12:00:00`, ISRAEL_TIMEZONE)

/** Serialize a Dayjs or Date instant to the "YYYY-MM-DD" civil-day string used in
 *  global state / URLs. Reads the calendar day in Israel time, so a picker value or an
 *  API instant in any zone lands on the correct Israel day. Accepts only fixed instants
 *  (Dayjs/Date) — pass a "YYYY-MM-DD" string through parseIsraelDate, not here. */
export const formatIsraelDate = (value: dayjs.Dayjs | Date): string =>
  toIsraelTimezone(value).format('YYYY-MM-DD')

/** Add (or subtract) calendar units to a "YYYY-MM-DD" civil-day string, returning a
 *  "YYYY-MM-DD" string. Defaults to days; pass a unit for week/month/year arithmetic
 *  (e.g. the operator page's time-range selector). Timezone-neutral: parses and reads in
 *  UTC, where every day is exactly 24h, so month/year/leap rollover is handled with no DST
 *  hazard. */
export const shiftIsraelDate = (
  date: string,
  amount: number,
  unit: 'day' | 'week' | 'month' | 'year' = 'day',
): string => dayjs.utc(date).add(amount, unit).format('YYYY-MM-DD')

/** Clamp a "YYYY-MM-DD" civil day so it is never after today (Israel). Pure lexicographic
 *  min — ISO dates sort chronologically — with the only tz touch isolated in
 *  todayIsraelDate(). Re-evaluates today on every call (functional, not a frozen default). */
export const clampToToday = (date: string): string => {
  const today = todayIsraelDate()
  return date > today ? today : date
}

/** Coerce an untrusted date string to the canonical "YYYY-MM-DD" civil day, or undefined
 *  if missing/unparsable. Accepts the civil form directly (the at-rest shape in URLs and
 *  global state) and also tolerates a legacy full datetime (e.g. an older shared link that
 *  serialized a date via .toISOString()), reading the Israel calendar day off that instant.
 *  Returns undefined — not a today-fallback — so callers can supply their own default for an
 *  absent or corrupt value. For an already-validated civil string use parseIsraelDate. */
export const normalizeIsraelDate = (value?: string): string | undefined => {
  if (!value) return undefined
  if (isValidSearchDate(value)) return value
  const parsed = dayjs(value)
  return parsed.isValid() ? formatIsraelDate(parsed) : undefined
}

// ── API date params (`format: date`) ─────────────────────────────────────────
//
// Convert a civil day to the `Date` the generated client expects for date-only
// (calendar-day) params. Both helpers anchor at noon UTC; see toApiDate for why.

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

/** "YYYY-MM-DD" civil-day string → the Date a `format: date` API param expects.
 *  Composes parseIsraelDate + toApiDate so callers holding the canonical string form
 *  pass it straight to the client without materializing a Dayjs by hand. */
export const apiDateFromString = (date: string): Date => toApiDate(parseIsraelDate(date))

// ── Service day (Israel transit) ─────────────────────────────────────────────
//
// The app invents a "service day": rides from 00:00 of the selected day through 04:00
// the next morning are treated as one day (late-night service belongs to the day it
// started). The backend has no such concept — it files every ride under its own calendar
// day — so these helpers are the single place that window is defined.

/** The service-day window for a "YYYY-MM-DD" date, as instants: 00:00 Israel time through
 *  04:00 the next morning. The late-night tail (00:00–04:00 of the following calendar day)
 *  belongs to this service day. `start` is a wall-clock midnight so it is DST-stable.
 *
 *  Single source of truth for the window — the gaps fetch, the routes service, the
 *  single-line/lineProfile ride list, the vehicle ride list, and the gaps table's token
 *  formatting all derive their bounds from here, so they can't drift apart. Use for
 *  `format: date-time` (instant) params; for `format: date` calendar-day params use
 *  getServiceDayDateBounds. */
export function getServiceDayTimeBounds(date: string): { start: dayjs.Dayjs; end: dayjs.Dayjs } {
  const start = parseIsraelDate(date).startOf('day')
  const end = start.add(1, 'day').startOf('day').add(4, 'hours')
  return { start, end }
}

/** The two civil calendar days a service day spans, as "YYYY-MM-DD" strings: the date
 *  itself and the next day (whose 00:00–04:00 late-night tail belongs to this service day).
 *  Derived from the window endpoints of getServiceDayTimeBounds so the two stay in lock-step
 *  if the window ever changes. Callers convert to the `Date` a `format: date` API param
 *  expects at the boundary, via apiDateFromString. */
export function getServiceDayDateBounds(date: string): { today: string; tomorrow: string } {
  const { start, end } = getServiceDayTimeBounds(date)
  return { today: formatIsraelDate(start), tomorrow: formatIsraelDate(end) }
}

// ── Datetime from untrusted input ────────────────────────────────────────────

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

// ── Instants (moments on the global timeline) ─────────────────────────────────
//
// An instant is a precise point in time — a SIRI ping, a ride's scheduled start, a gap's
// actual/planned start. Unlike a civil date it is NOT zone-less, so its at-rest form (in
// the persisted query cache, a shared URL, derived state) is a fully-qualified ISO-8601
// string WITH the Israel offset, e.g. "2024-07-12T14:30:00+03:00". That form is JSON-native
// (survives the localStorage-persisted React Query cache, where a Dayjs/Date silently
// decays to a string), shows the Israel wall-clock on sight, and round-trips through dayjs.
// Every datetime the stride API returns is real UTC (carries +00:00), so we trust it as a
// true instant and only project to Israel for reading.
//
// INVARIANT: never compare or sort the raw strings — the Israel offset flips at DST, so
// lexicographic order is wrong across a transition. Always parseInstant first, then compare
// the Dayjs (or its .valueOf()).

/** Materialize an instant (API Date, epoch-ms, or ISO string) into a Dayjs in Israel time.
 *  The single API→Dayjs border. A bare (offset-less) string is read as UTC — the stride
 *  API's convention — so it stays correct even if an endpoint ever drops the +00:00. Returns
 *  undefined for missing/invalid input. Replaces the ad-hoc `dayjs(apiDate)` calls and the
 *  now-vestigial gapsService.parseTime (every API datetime is already real UTC, so its old
 *  `.utcOffset(0, true)` reinterpret was a no-op). */
export const parseInstant = (value?: dayjs.ConfigType): dayjs.Dayjs | undefined => {
  if (value == null || value === '') return undefined
  const instant = dayjs.utc(value).tz(ISRAEL_TIMEZONE)
  return instant.isValid() ? instant : undefined
}

/** Serialize an instant to the canonical at-rest string: ISO-8601 carrying the Israel offset
 *  ("…+03:00" / "…+02:00"). Use whenever an instant must live in a persisted query cache or
 *  shared state; read it back with parseInstant. */
export const serializeInstant = (value: dayjs.ConfigType): string =>
  dayjs.utc(value).tz(ISRAEL_TIMEZONE).format()

/** Format an instant for display, always in Israel time. The single display border — use
 *  instead of `dayjs(x).format(...)`, which renders in the runtime zone, so a user abroad,
 *  SSR, or CI (Jest defaults to UTC) sees the wrong clock time. */
export const formatInstant = (value: dayjs.ConfigType, template?: string): string =>
  dayjs.utc(value).tz(ISRAEL_TIMEZONE).format(template)

/** Convert a materialized instant to the `Date` a `format: date-time` API param expects
 *  (the SIRI/GTFS recorded/arrival/start windows). The instant analog of toApiDate; a real
 *  instant survives the Date round-trip losslessly, so this is `.toDate()` with one
 *  documented home. NEVER use for `format: date` calendar-day params — use toApiDate. */
export const instantToApi = (value: dayjs.Dayjs): Date => value.toDate()

/** The current instant as the canonical at-rest string: Israel-offset ISO. The clock reader
 *  that yields the string form directly, exactly as todayIsraelDate() does for civil days —
 *  so "now" can be stored/compared without ever materializing a Dayjs. Call at the use-site,
 *  never freeze in a module const (it goes stale). */
export const nowIsraelInstant = (): string => serializeInstant(dayjs())

/** The current instant materialized as a Dayjs, for compute/compare sites. The Dayjs form of
 *  nowIsraelInstant() — the string is the canonical at-rest shape; this is its materialization
 *  (parseIsraelDate(todayIsraelDate()) is the civil-day analog). */
export const nowInstant = (): dayjs.Dayjs => parseInstant(nowIsraelInstant())!

// ── Time-of-day (wall-clock "HH:mm", no date) ─────────────────────────────────
//
// A user-selected moment (the timeBasedMap / historicTimeline / complaint pickers) is an
// Israel wall-clock, not a recorded instant: it lives at rest as a "HH:mm" string (plus a
// civil-date string), with NO offset, materialized to a Dayjs only at the picker boundary.

/** Apply a "HH:mm" wall-clock to a "YYYY-MM-DD" civil day, yielding the Dayjs instant at that
 *  Israel-local moment. The border for the time selectors. Malformed parts fall back to 0. */
export const atTimeOfDay = (date: string, time: string): dayjs.Dayjs => {
  const [hour, minute] = time.split(':').map(Number)
  return parseIsraelDate(date)
    .hour(Number.isFinite(hour) ? hour : 0)
    .minute(Number.isFinite(minute) ? minute : 0)
    .second(0)
    .millisecond(0)
}

/** Read the "HH:mm" Israel wall-clock off an instant. */
export const formatTimeOfDay = (value: dayjs.ConfigType): string => formatInstant(value, 'HH:mm')

// Set default locale
dayjs.locale('he')

export default dayjs

export type Dayjs = dayjs.Dayjs

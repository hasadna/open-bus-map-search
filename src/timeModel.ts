/**
 * timeModel — the four rails of time-at-rest, as branded string types.
 *
 * The app moves dates and times around as PLAIN STRINGS (global state, URL params,
 * the localStorage-persisted React Query cache, component props). Strings survive JSON
 * round-trips, compare with `===`, and never silently decay the way a Dayjs/Date does
 * when it passes through storage. The price of strings is that the compiler can't tell
 * a calendar date from a clock time from an instant — they are all just `string`, and
 * mixing them up (feeding "14:30" where "2026-06-30" is expected, lexicographically
 * comparing two differently-offset instants) is a class of bug that only surfaces at
 * runtime, often only across a DST boundary.
 *
 * This module fixes that at the TYPE level by giving each rail a distinct BRAND. A
 * brand is a phantom property that exists only in the type system (zero bytes at
 * runtime), so a branded value still IS a plain string everywhere it matters, while the
 * compiler refuses to interchange the rails.
 *
 * The four rails
 * ──────────────
 *   1. CivilDate     "YYYY-MM-DD"        an Israel-local calendar day. Zone-less and
 *                                        time-less. Sorts lexicographically.
 *   2. WallTime      "HH:mm"             a clock time within a (service) day. The hour
 *                                        may exceed 23 for past-midnight service rides
 *                                        ("25:30"). Zone-less and date-less.
 *   3. CivilDateTime { date, time }      a civil day + wall time, still carrying NO
 *                                        offset. It is NOT a moment until it is fused
 *                                        with the Israel timezone — and that fusion
 *                                        lives one layer up (it needs DST knowledge),
 *                                        not here.
 *   4. Instant       "…Z" ISO-8601 (UTC) the only self-sufficient rail: a true point on
 *                                        the global timeline. Stored canonically in UTC
 *                                        so that string-equality == instant-equality
 *                                        (load-bearing for React Query keys, URL params,
 *                                        and dedup). The Israel "+03:00" rendering is for
 *                                        DISPLAY only and never lives at rest.
 *
 * Why there is no timezone code here
 * ──────────────────────────────────
 * timeModel is a pure leaf: it depends on nothing (not even dayjs) and knows only the
 * SHAPE of each rail. Anything that needs the Israel timezone database — fusing a
 * CivilDateTime into an Instant, projecting an Instant to an Israel wall-clock for
 * display, computing service-day windows — lives in `src/dayjs.ts`, which imports these
 * brand types. That keeps DST policy in exactly one place and this foundation trivially
 * testable with no clock or zone dependency.
 *
 * Constructors funnel; guards are strict
 * ──────────────────────────────────────
 * Each smart constructor (`civilDate`, `wallTime`, `instant`) validates its input and
 * returns the CANONICAL form, or `null`. They are lenient on input and strict on output:
 * `instant("…+03:00")` is accepted and normalized to the canonical "…Z"; `wallTime("9:30")`
 * is accepted and zero-padded to "09:30". The type guards (`isCivilDate`, …) recognize
 * ONLY the canonical form, so a non-canonical instant string (e.g. an offset rendering)
 * is correctly rejected as not-a-value-at-rest. The lone `as` assertion inside each
 * constructor is the single sanctioned mint point: a value of a rail type can be produced
 * only by passing validation.
 */

// ── Branding ─────────────────────────────────────────────────────────────────
//
// A `unique symbol` property key that is never assigned at runtime. Two rails differ
// only in the literal TYPE of this phantom key, so `CivilDate` and `WallTime` are
// mutually unassignable, while both remain assignable TO `string` (they have all a
// string has, plus the phantom). The symbol form means the brand cannot even be written
// by hand outside this module — the constructors are the only door.

declare const brand: unique symbol

type Brand<Base, Tag extends string> = Base & { readonly [brand]: Tag }

// ── Rail types ───────────────────────────────────────────────────────────────

/** An Israel-local calendar day, "YYYY-MM-DD". Zone-less, time-less. */
export type CivilDate = Brand<string, 'CivilDate'>

/** A clock time within a (service) day, "HH:mm". The hour may exceed 23 for
 *  past-midnight service rides (e.g. "25:30"). Zone-less, date-less. */
export type WallTime = Brand<string, 'WallTime'>

/** A true point on the global timeline, ISO-8601 in canonical UTC ("…Z", millisecond
 *  precision). Stored in UTC so string-equality == instant-equality. */
export type Instant = Brand<string, 'Instant'>

/** A civil day paired with a wall time, carrying NO offset. Becomes a moment only when
 *  fused with the Israel timezone (the fusion point lives in the tz layer). */
export interface CivilDateTime {
  readonly date: CivilDate
  readonly time: WallTime
}

// ── CivilDate ────────────────────────────────────────────────────────────────

// e.g. matches "2026-06-30"; rejects "2026-6-30" (unpadded), "2026/06/30", "2026-06-30T00:00"
const CIVIL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Parse a "YYYY-MM-DD" string into a CivilDate, or null. Rejects malformed shapes and
 *  overflow dates ("2026-02-30", "2026-13-01") that a naive parse would silently roll to
 *  a different day. Validation is timezone-free: a calendar day has no zone. */
export function civilDate(value: string): CivilDate | null {
  const match = CIVIL_DATE_RE.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  // Round-trip through a UTC Date to reject overflow (Feb 30 → Mar 2, etc.).
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null
  }
  return value as CivilDate
}

/** True if `value` is already a canonical CivilDate string. */
export function isCivilDate(value: unknown): value is CivilDate {
  return typeof value === 'string' && civilDate(value) === value
}

// ── WallTime ─────────────────────────────────────────────────────────────────

// e.g. matches "9:30", "09:30", "25:30"; rejects "12:5" (unpadded minute), "0930", "14:30:00"
const WALL_TIME_RE = /^(\d{1,2}):(\d{2})$/

// Format-level ceiling for the hour. A wall time wraps at most one extra day in this
// domain (a past-midnight service ride), so the widest honest range is 00:00–47:59.
// The exact transit ceiling (the service-day window is <=28h, so real tokens never
// exceed 27:59) is DOMAIN policy and is enforced where service days are constructed —
// not baked into this shape-level type.
const WALL_TIME_MAX_HOUR = 47

/** Parse an "HH:mm" string into a WallTime, or null. Accepts a 1- or 2-digit hour and
 *  zero-pads it ("9:30" → "09:30"); requires a 2-digit minute. The hour may be >=24 for
 *  past-midnight service rides. Minute must be 0–59; hour 0–47. */
export function wallTime(value: string): WallTime | null {
  const match = WALL_TIME_RE.exec(value)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour < 0 || hour > WALL_TIME_MAX_HOUR || minute < 0 || minute > 59) return null
  return `${hour.toString().padStart(2, '0')}:${match[2]}` as WallTime
}

/** True if `value` is already a canonical WallTime string (zero-padded "HH:mm"). A valid
 *  but unpadded value like "9:30" is rejected — use `wallTime()` to canonicalize it. */
export function isWallTime(value: unknown): value is WallTime {
  return typeof value === 'string' && wallTime(value) === value
}

// ── CivilDateTime ────────────────────────────────────────────────────────────

/** Pair an already-validated CivilDate and WallTime into a CivilDateTime. */
export function civilDateTime(date: CivilDate, time: WallTime): CivilDateTime {
  return { date, time }
}

/** Parse a raw date + time string pair into a CivilDateTime, or null if either part is
 *  malformed. Convenience funnel over civilDate + wallTime. */
export function parseCivilDateTime(date: string, time: string): CivilDateTime | null {
  const d = civilDate(date)
  const t = wallTime(time)
  return d !== null && t !== null ? { date: d, time: t } : null
}

// ── Instant ──────────────────────────────────────────────────────────────────

// An instant string must carry an explicit zone designator (Z or ±HH:mm). A zone-less
// "2026-06-30T14:30" is a CivilDateTime, not an Instant, and must not slip through —
// JS would otherwise parse it in the runtime-local zone, which is exactly the ambiguity
// this rail exists to abolish.
// e.g. matches the leading "2026-07-01T03:46" of any ISO datetime; rejects "2026-07-01" (no time), "1720783800000" (epoch ms)
const INSTANT_SHAPE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/
// e.g. matches a trailing "Z", "+00:00", "-05:00", "+0300"; rejects a zone-less "…T14:30"
const INSTANT_ZONE_RE = /(?:Z|[+-]\d{2}:?\d{2})$/

/** Parse a zoned ISO-8601 datetime string into a canonical UTC Instant ("…Z", with
 *  millisecond precision), or null. Lenient on input zone — an Israel "+03:00" rendering
 *  is accepted and converted to UTC — strict on output: the result is always the same
 *  canonical string for a given moment, so `===` on two Instants is moment-equality.
 *  Rejects zone-less input (that is a CivilDateTime) and anything Date.parse can't read. */
export function instant(value: string): Instant | null {
  if (!INSTANT_SHAPE_RE.test(value) || !INSTANT_ZONE_RE.test(value)) return null
  const ms = Date.parse(value)
  if (Number.isNaN(ms)) return null
  return new Date(ms).toISOString() as Instant
}

/** True if `value` is already a CANONICAL Instant string (UTC "…Z", millisecond
 *  precision). A valid-but-non-canonical instant (e.g. "…+03:00", or a "…Z" without
 *  milliseconds) is rejected — only the at-rest form passes, which is what keeps
 *  string-equality == instant-equality an invariant. */
export function isInstant(value: unknown): value is Instant {
  return typeof value === 'string' && instant(value) === value
}

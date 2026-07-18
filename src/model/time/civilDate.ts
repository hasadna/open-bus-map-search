/**
 * CivilDate — an Israel-local calendar day, as a branded "YYYY-MM-DD" string.
 *
 * This is the first of the app's "time rails": the distinct meanings of "time" that the
 * codebase has historically conflated into a bare `string` / `Dayjs` / `Date`, which is
 * where most of our timezone bugs come from. A CivilDate is the simplest rail — a
 * calendar day with NO time-of-day and NO zone. It is immune to DST by construction, and
 * it sorts lexicographically ("2026-03-01" < "2026-03-02").
 *
 * Why a string, not a Dayjs/Date
 * ──────────────────────────────
 * The app moves dates around as plain strings (global state, URL params, the
 * localStorage-persisted React Query cache, component props). A string survives JSON
 * round-trips, compares with `===`, and never silently decays the way a Dayjs/Date does
 * when it passes through storage or picks up a runtime-local zone. A calendar day has no
 * moment attached, so wrapping it in a Date (which always is a moment) is exactly the
 * conversion that drifts it to the neighbouring UTC day — the bug this rail abolishes.
 *
 * Why a BRAND
 * ───────────
 * A bare "YYYY-MM-DD" string is indistinguishable, to the compiler, from a clock time or
 * an instant — they are all just `string`, and mixing them up only blows up at runtime.
 * The brand is a phantom property that exists solely in the type system (zero bytes at
 * runtime): a `CivilDate` still IS a plain string everywhere it matters, but the compiler
 * refuses to accept an arbitrary string where a CivilDate is required. The only way to
 * mint one is to pass through the `civilDate()` constructor below.
 *
 * Why there is no timezone code here
 * ──────────────────────────────────
 * This module is a PURE LEAF: it imports nothing (not even dayjs) and knows only the
 * SHAPE of a calendar day. Anything that needs the Israel timezone — materializing a
 * CivilDate into a real moment for an API call, or deriving today's CivilDate from the
 * clock — lives one layer up in `src/dayjs.ts`, which imports this type. That keeps DST
 * policy in one place and keeps this foundation trivially testable with no clock or zone.
 */

// ── Branding ─────────────────────────────────────────────────────────────────
//
// A `unique symbol` key that is never assigned at runtime. `CivilDate` is `string` plus
// this phantom, so it is assignable TO `string` but a bare `string` is not assignable to
// it. The symbol form means the brand cannot be written by hand outside this module — the
// constructor is the only door.

declare const brand: unique symbol

/** An Israel-local calendar day, "YYYY-MM-DD". Zone-less, time-less. */
export type CivilDate = string & { readonly [brand]: 'CivilDate' }

// e.g. matches "2026-06-30"; rejects "2026-6-30" (unpadded), "2026/06/30", "2026-06-30T00:00"
const CIVIL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Parse a "YYYY-MM-DD" string into a CivilDate, or `null` if it is not a real calendar
 * day. Rejects malformed shapes and overflow dates ("2026-02-30", "2026-13-01") that a
 * naive parse would silently roll forward to a different day. Validation is timezone-free
 * — a calendar day has no zone — so this stays a pure function of its input.
 *
 * The canonical form equals the input (the regex already requires zero-padded fields), so
 * a valid input is returned verbatim, just re-typed as a CivilDate.
 */
export function civilDate(value: string): CivilDate | null {
  const match = CIVIL_DATE_RE.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  // Round-trip through a UTC Date to reject overflow (Feb 30 → Mar 2, etc.). UTC (not
  // local) so the probe itself can never be shifted across a day boundary by a zone.
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

/** True if `value` is already a canonical CivilDate string. Narrows the type for callers
 *  that receive an untrusted `unknown` / `string` (URL params, cache reads, props). */
export function isCivilDate(value: unknown): value is CivilDate {
  return typeof value === 'string' && civilDate(value) === value
}

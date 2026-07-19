/**
 * CivilDate — an Israel-local calendar day, as a branded "YYYY-MM-DD" string.
 *
 * Kept as a string (not a Dayjs/Date) so it survives JSON / storage / URL round-trips and
 * compares by value (`===`, React deps, query keys), and can't silently decay into a
 * moment that drifts to a neighbouring UTC day. The brand is a compile-time-only phantom —
 * at runtime it IS a plain string — that stops a bare string, clock time, or instant being
 * used where a calendar day is meant. `civilDate()` is the only way to mint one.
 *
 * Pure core first (shape only, no clock/zone), then the timezone border.
 */
import dayjs, { type Dayjs, toIsraelTimezone } from 'src/dayjs'

// ══ Pure core ═══════════════════════════════════════════════════════════════

declare const brand: unique symbol

/** An Israel-local calendar day, "YYYY-MM-DD". Zone-less, time-less. */
export type CivilDate = string & { readonly [brand]: 'CivilDate' }

const CIVIL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Parse a "YYYY-MM-DD" string into a CivilDate, or `null`. Returns valid input verbatim
 *  (the regex already requires the canonical form). */
export function civilDate(value: string): CivilDate | null {
  const match = CIVIL_DATE_RE.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  // Round-trip through a UTC Date to reject overflow (Feb 30 → Mar 2, "2026-13-01", …).
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

/** True if `value` is already a canonical CivilDate string. Narrows untrusted
 *  `unknown` / `string` (URL params, cache reads, props). */
export function isCivilDate(value: unknown): value is CivilDate {
  return typeof value === 'string' && civilDate(value) === value
}

/** Shift a CivilDate by whole calendar days. Pure UTC-date arithmetic (no clock,
 *  no zone), so it can't drift across a DST edge. */
export function addDays(date: CivilDate, days: number): CivilDate {
  const [year, month, day] = date.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return civilDate(shifted.toISOString().slice(0, 10))!
}

// ══ Timezone border ═════════════════════════════════════════════════════════
// The only place a CivilDate is fused with the Israel timezone.

/** The Israel calendar day `value` falls on, or null if unparsable. Reads any moment
 *  (Dayjs / Date / instant string) in the Israel zone — so an instant just after midnight
 *  UTC maps to the Israeli "tomorrow". A caller sure its input is valid uses `toCivilDate(x)!`. */
export const toCivilDate = (value?: dayjs.ConfigType): CivilDate | null =>
  civilDate(toIsraelTimezone(value).format('YYYY-MM-DD'))

/** Today's Israel calendar day. The `!` is sound: the clock is always a valid moment. */
export const todayCivilDate = (): CivilDate => toCivilDate()!

/** CivilDate → the `Date` handed to the api-client for a date-only param, anchored at
 *  12:00 UTC. The noon anchor is load-bearing: an Israel-midnight Date is 21:00–22:00Z of
 *  the *previous* day, so it would serialize a day back and drop the intended day's rows. */
export const civilDateToApiDate = (date: CivilDate): Date => new Date(`${date}T12:00:00Z`)

/** CivilDate → a Dayjs on the same 12:00-UTC anchor, for frontend compute/display. */
export const civilDateToDayjs = (date: CivilDate): Dayjs => dayjs(civilDateToApiDate(date))

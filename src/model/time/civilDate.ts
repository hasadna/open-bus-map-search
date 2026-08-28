/**
 * CivilDate — an Israel-local calendar day, as a branded "YYYY-MM-DD" string.
 *
 * A string, not a Dayjs/Date, so it survives JSON / storage / URL round-trips and compares
 * by value (`===`, React deps, query keys) instead of decaying into a moment that drifts to
 * a neighbouring UTC day. The brand is erased at runtime; `civilDate()` is the only way to
 * mint one.
 */
import dayjs, { type Dayjs, toIsraelTimezone } from 'src/dayjs'

declare const brand: unique symbol

export type CivilDate = string & { readonly [brand]: 'CivilDate' }

const CIVIL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

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

export function isCivilDate(value: unknown): value is CivilDate {
  return typeof value === 'string' && civilDate(value) === value
}

export function addDays(date: CivilDate, days: number): CivilDate {
  const [year, month, day] = date.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  // Built and read back in UTC, so the slice IS the shifted day — a local
  // `new Date(y, m, d)` here would roll back across the date line.
  return civilDate(shifted.toISOString().slice(0, 10))!
}

// Below this line is the only place a CivilDate is fused with the Israel timezone.

/** Reads `value` in the Israel zone, so an instant just after midnight UTC maps to the
 *  Israeli "tomorrow". */
export const toCivilDate = (value?: dayjs.ConfigType): CivilDate | null =>
  civilDate(toIsraelTimezone(value).format('YYYY-MM-DD'))

/** The `!` is sound: the clock is always a valid moment. */
export const todayCivilDate = (): CivilDate => toCivilDate()!

/** For the api-client's date-only params. The noon anchor is load-bearing: the client
 *  serializes these as a UTC date, and an Israel-midnight Date is 21:00–22:00Z of the
 *  *previous* day — it would ask for the wrong day's rows. */
export const civilDateToApiDate = (date: CivilDate): Date => new Date(`${date}T12:00:00Z`)

/** The Israel zone is carried on purpose: a zone-less Dayjs renders in the *browser's*
 *  zone, where noon UTC is already tomorrow from UTC+12 eastward. */
export const civilDateToDayjs = (date: CivilDate): Dayjs =>
  toIsraelTimezone(civilDateToApiDate(date))

/** For units `addDays` can't do — going through the noon anchor keeps month-ends and DST
 *  from drifting the day. The `!` is sound: a valid CivilDate shifted by whole units is
 *  still a valid moment. */
export function shiftCivilDate(
  date: CivilDate,
  amount: number,
  unit: dayjs.ManipulateType,
): CivilDate {
  return toCivilDate(civilDateToDayjs(date).add(amount, unit))!
}

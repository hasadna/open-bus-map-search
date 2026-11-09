import type { StrideLiteCoverageDay } from 'src/api/strideLite'
import { type CivilDate, civilDateToDayjs } from 'src/model/time/civilDate'

/**
 * The three readings production cannot tell apart, as five states:
 * `ok`/`quiet` are the data arriving (with many or few buses in it), `shortDownload`/`noData`
 * are the data not arriving, and `pipelineFault` is the data arriving broken.
 */
export type DayHealth = 'ok' | 'quiet' | 'shortDownload' | 'noData' | 'pipelineFault'

/** One SIRI snapshot a minute, so a whole day is ~1,430 of them — on Shabbat too, since the
 *  download runs whether or not buses do. */
const HEALTHY_SNAPSHOTS = 1430
const SHORT_DOWNLOAD_SNAPSHOTS = 1400

const WEEKDAY_VEHICLE_LOCATIONS = 7_500_000

/** Shabbat, not a fault: Friday's service stops in the afternoon and Saturday's barely runs. */
const VEHICLE_LOCATIONS_FACTOR: Partial<Record<number, number>> = { 5: 0.5, 6: 1 / 6 }

/** Below this share of the day's own expectation, buses — not bytes — were missing. */
const QUIET_RATIO = 0.6

export const expectedVehicleLocations = (day: CivilDate): number =>
  WEEKDAY_VEHICLE_LOCATIONS * (VEHICLE_LOCATIONS_FACTOR[civilDateToDayjs(day).day()] ?? 1)

export const expectedSnapshots = (): number => HEALTHY_SNAPSHOTS

/** What decided a day's reading, with the numbers a person needs to judge it. */
export type HealthReason =
  | { key: 'noSnapshots' }
  | { key: 'duplicateIds'; count: number }
  | { key: 'noLocations' }
  | { key: 'shortDownload'; missing: number }
  | { key: 'quiet'; percent: number }

export type Diagnosis = { health: DayHealth; reason?: HealthReason }

export const diagnoseCoverageDay = (day: StrideLiteCoverageDay): Diagnosis => {
  if (day.snapshots === 0) return { health: 'noData', reason: { key: 'noSnapshots' } }
  if (day.duplicateIds > 0) {
    return { health: 'pipelineFault', reason: { key: 'duplicateIds', count: day.duplicateIds } }
  }
  if (day.vehicleLocations === 0) return { health: 'pipelineFault', reason: { key: 'noLocations' } }
  if (day.snapshots < SHORT_DOWNLOAD_SNAPSHOTS) {
    return {
      health: 'shortDownload',
      reason: { key: 'shortDownload', missing: HEALTHY_SNAPSHOTS - day.snapshots },
    }
  }
  const expected = expectedVehicleLocations(day.day)
  if (day.vehicleLocations < QUIET_RATIO * expected) {
    return {
      health: 'quiet',
      reason: { key: 'quiet', percent: Math.round((100 * day.vehicleLocations) / expected) },
    }
  }
  return { health: 'ok' }
}

export const classifyCoverageDay = (day: StrideLiteCoverageDay): DayHealth =>
  diagnoseCoverageDay(day).health

export const HEALTH_ORDER: DayHealth[] = ['ok', 'quiet', 'shortDownload', 'noData', 'pipelineFault']

export const isFault = (health: DayHealth): boolean =>
  health === 'shortDownload' || health === 'noData' || health === 'pipelineFault'

export type CoverageDayHealth = StrideLiteCoverageDay & Diagnosis

/** Oldest day first, the direction a time axis reads; `/coverage` answers newest first. */
export const withHealthOldestFirst = (days: StrideLiteCoverageDay[]): CoverageDayHealth[] =>
  days
    .map((day) => ({ ...day, ...diagnoseCoverageDay(day) }))
    .sort((a, b) => a.day.localeCompare(b.day))

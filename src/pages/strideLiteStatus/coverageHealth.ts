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

export const classifyCoverageDay = (day: StrideLiteCoverageDay): DayHealth => {
  if (day.snapshots === 0) return 'noData'
  if (day.duplicateIds > 0) return 'pipelineFault'
  // Snapshots that hold no locations at all, or rides that reached none of the GTFS they are
  // joined against, mean the data arrived and the processing of it failed.
  if (day.vehicleLocations === 0) return 'pipelineFault'
  if (day.rides > 0 && day.ridesLinkedToGtfs === 0) return 'pipelineFault'
  if (day.snapshots < SHORT_DOWNLOAD_SNAPSHOTS) return 'shortDownload'
  if (day.vehicleLocations < QUIET_RATIO * expectedVehicleLocations(day.day)) return 'quiet'
  return 'ok'
}

export const HEALTH_ORDER: DayHealth[] = ['ok', 'quiet', 'shortDownload', 'noData', 'pipelineFault']

export const isFault = (health: DayHealth): boolean =>
  health === 'shortDownload' || health === 'noData' || health === 'pipelineFault'

export type CoverageDayHealth = StrideLiteCoverageDay & { health: DayHealth }

/** Oldest day first, the direction a time axis reads; `/coverage` answers newest first. */
export const withHealthOldestFirst = (days: StrideLiteCoverageDay[]): CoverageDayHealth[] =>
  days
    .map((day) => ({ ...day, health: classifyCoverageDay(day) }))
    .sort((a, b) => a.day.localeCompare(b.day))

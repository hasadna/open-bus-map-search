import type { StrideLiteCoverageDay } from 'src/api/strideLite'
import { addDays, civilDate } from 'src/model/time/civilDate'
import {
  classifyCoverageDay,
  diagnoseCoverageDay,
  expectedVehicleLocations,
  selectDayRange,
  withHealthOldestFirst,
} from './coverageHealth'

// 2026-11-04 is a Wednesday, 2026-11-06 a Friday, 2026-11-07 a Saturday.
const WEDNESDAY = civilDate('2026-11-04')!
const FRIDAY = civilDate('2026-11-06')!
const SATURDAY = civilDate('2026-11-07')!

const day = (overrides: Partial<StrideLiteCoverageDay> = {}): StrideLiteCoverageDay => ({
  day: WEDNESDAY,
  snapshots: 1430,
  vehicleLocations: 7_500_000,
  duplicateIds: 0,
  rides: 60_000,
  ridesWithDuration: 59_000,
  ridesLinkedToGtfs: 59_500,
  measuredAt: '2026-11-05T02:00:00Z',
  ...overrides,
})

describe('classifyCoverageDay', () => {
  test('a full weekday is healthy', () => {
    expect(classifyCoverageDay(day())).toBe('ok')
  })

  test('Shabbat volumes are healthy, not a fault', () => {
    expect(classifyCoverageDay(day({ day: FRIDAY, vehicleLocations: 3_700_000 }))).toBe('ok')
    expect(classifyCoverageDay(day({ day: SATURDAY, vehicleLocations: 1_240_000 }))).toBe('ok')
  })

  test('the same Saturday volume on a weekday reads as few buses, not as a fault', () => {
    expect(classifyCoverageDay(day({ day: WEDNESDAY, vehicleLocations: 1_240_000 }))).toBe('quiet')
  })

  test('no snapshots at all means no data arrived', () => {
    expect(classifyCoverageDay(day({ snapshots: 0, vehicleLocations: 0 }))).toBe('noData')
  })

  test('a partial download is distinguished from no data', () => {
    expect(classifyCoverageDay(day({ snapshots: 900 }))).toBe('shortDownload')
  })

  test('duplicate ids are a pipeline fault even on a full day', () => {
    expect(classifyCoverageDay(day({ duplicateIds: 17 }))).toBe('pipelineFault')
  })

  test('snapshots that hold no locations are a pipeline fault', () => {
    expect(classifyCoverageDay(day({ vehicleLocations: 0 }))).toBe('pipelineFault')
  })

  test('rides not linked to GTFS do not decide the reading', () => {
    expect(classifyCoverageDay(day({ ridesLinkedToGtfs: 0 }))).toBe('ok')
  })

  test('a pipeline fault outranks a short download', () => {
    expect(classifyCoverageDay(day({ snapshots: 900, duplicateIds: 1 }))).toBe('pipelineFault')
  })
})

describe('diagnoseCoverageDay', () => {
  test('a healthy day needs no reason', () => {
    expect(diagnoseCoverageDay(day())).toEqual({ health: 'ok' })
  })

  test('a short download says how many one-minute snapshots are missing', () => {
    expect(diagnoseCoverageDay(day({ snapshots: 1116 }))).toEqual({
      health: 'shortDownload',
      reason: { key: 'shortDownload', missing: 314 },
    })
  })

  test('a quiet day says what share of its own expectation arrived', () => {
    expect(diagnoseCoverageDay(day({ vehicleLocations: 3_000_000 }))).toEqual({
      health: 'quiet',
      reason: { key: 'quiet', percent: 40 },
    })
  })

  test('duplicate ids carry their count', () => {
    expect(diagnoseCoverageDay(day({ duplicateIds: 17 }))).toEqual({
      health: 'pipelineFault',
      reason: { key: 'duplicateIds', count: 17 },
    })
  })

  test('snapshots without locations and no snapshots at all each name themselves', () => {
    expect(diagnoseCoverageDay(day({ vehicleLocations: 0 })).reason).toEqual({ key: 'noLocations' })
    expect(diagnoseCoverageDay(day({ snapshots: 0, vehicleLocations: 0 })).reason).toEqual({
      key: 'noSnapshots',
    })
  })
})

describe('expectedVehicleLocations', () => {
  test('scales down for Friday and Saturday only', () => {
    const weekday = expectedVehicleLocations(WEDNESDAY)
    expect(expectedVehicleLocations(FRIDAY)).toBeCloseTo(weekday / 2)
    expect(expectedVehicleLocations(SATURDAY)).toBeCloseTo(weekday / 6)
  })
})

describe('withHealthOldestFirst', () => {
  test('reverses the API order and tags each day', () => {
    const result = withHealthOldestFirst([
      day({ day: SATURDAY, vehicleLocations: 1_240_000 }),
      day({ day: FRIDAY, duplicateIds: 3 }),
      day({ day: WEDNESDAY }),
    ])
    expect(result.map((row) => row.day)).toEqual([WEDNESDAY, FRIDAY, SATURDAY])
    expect(result.map((row) => row.health)).toEqual(['ok', 'pipelineFault', 'ok'])
  })
})

describe('selectDayRange', () => {
  const days = Array.from(
    { length: 120 },
    (_, i) => withHealthOldestFirst([day({ day: addDays(civilDate('2026-07-01')!, i) })])[0],
  )

  test('defaults to the newest 90 days the backend has', () => {
    const range = selectDayRange(days, {})
    expect(range.to).toBe('2026-10-28')
    expect(range.from).toBe('2026-07-31')
    expect(range.days).toHaveLength(90)
    expect(range.oldest).toBe('2026-07-01')
    expect(range.newest).toBe('2026-10-28')
  })

  test('keeps both ends of a chosen range', () => {
    const range = selectDayRange(days, {
      from: civilDate('2026-07-10')!,
      to: civilDate('2026-07-12')!,
    })
    expect(range.days.map((row) => row.day)).toEqual(['2026-07-10', '2026-07-11', '2026-07-12'])
  })

  test('a chosen end alone shows the 90 days up to it', () => {
    const range = selectDayRange(days, { to: civilDate('2026-08-15')! })
    expect(range.from).toBe('2026-07-01')
    expect(range.days.at(-1)?.day).toBe('2026-08-15')
  })

  test('no data leaves the range empty', () => {
    expect(selectDayRange([], {}).days).toEqual([])
  })
})

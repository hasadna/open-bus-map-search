import { Dayjs } from 'src/dayjs'
import { convertGapsToHourlyStruct } from './useGapsList'

const mockTime = (hhmm: string) => ({ format: () => hhmm }) as unknown as Dayjs

describe('convertGapsToHourlyStruct', () => {
  it('returns an empty array for an empty gaps list', () => {
    expect(convertGapsToHourlyStruct([])).toEqual([])
  })

  it('ignores rides without plannedStartTime', () => {
    const result = convertGapsToHourlyStruct([{ plannedStartTime: undefined }])
    expect(result).toEqual([])
  })

  it('counts planned and actual rides correctly', () => {
    const result = convertGapsToHourlyStruct([
      { plannedStartTime: mockTime('06:00'), actualStartTime: mockTime('06:01') },
      { plannedStartTime: mockTime('07:00') },
    ])
    expect(result).toEqual([
      { planned_hour: '06:00', planned_rides: 1, actual_rides: 1 },
      { planned_hour: '07:00', planned_rides: 1, actual_rides: 0 },
    ])
  })

  it('aggregates rides with the same planned hour across multiple days', () => {
    const result = convertGapsToHourlyStruct([
      { plannedStartTime: mockTime('06:00'), actualStartTime: mockTime('06:01') },
      { plannedStartTime: mockTime('06:00'), actualStartTime: mockTime('06:02') },
      { plannedStartTime: mockTime('06:00') },
    ])
    expect(result).toEqual([{ planned_hour: '06:00', planned_rides: 3, actual_rides: 2 }])
  })
})

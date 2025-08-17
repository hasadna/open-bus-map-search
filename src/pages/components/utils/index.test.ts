import { HourlyData, sortByMode } from '.'
import { convertGapsToHourlyStruct as processData } from 'src/pages/gapsPatterns/useGapsList'
import { Gap, parseTime } from 'src/api/gapsService'

describe('sortByMode', () => {
  it('when mode param is "hour" - should be sorted properly', () => {
    const gapsResponse = [
      {
        planned_hour: '01:00',
        planned_rides: 1,
        actual_rides: 0,
      },
      {
        planned_hour: '02:00',
        planned_rides: 1,
        actual_rides: 1,
      },
    ] as HourlyData[]
    const res = sortByMode(gapsResponse, 'hour')
    expect(res[0].planned_hour).toBe('01:00')
    expect(res[0].planned_rides).toBe(1)
  })

  it('when mode param is severity - should be sorted properly', () => {
    const gapsResponse = [
      {
        planned_hour: '01:00',
        planned_rides: 1,
        actual_rides: 1,
      },
      {
        planned_hour: '02:00',
        planned_rides: 1,
        actual_rides: 0,
      },
    ] as HourlyData[]
    const res = sortByMode(gapsResponse, 'severity')
    /* record with less actual rides should come first */
    expect(res[0].actual_rides).toBe(0)
  })

  it('should convert gapList to HourlyData structure', () => {
    const list: Gap[] = [
      {
        plannedStartTime: parseTime(new Date('2023-10-04T02:00')),
        actualStartTime: parseTime(new Date('2023-10-04T02:00')),
      },
    ]
    const [results] = processData(list)
    expect(results).toEqual({
      actual_rides: 1,
      planned_hour: '05:00',
      planned_rides: 1,
    })
  })

  it('should convert gapList time entry with null value to - 0', () => {
    const list: Gap[] = [
      {
        plannedStartTime: parseTime(new Date('2023-10-04T02:20')),
        actualStartTime: undefined,
      },
    ]
    const [results] = processData(list)

    expect(results).toEqual({
      planned_hour: '05:20',
      planned_rides: 1,
      actual_rides: 0,
    })
  })

  it('should convert entries at same time to single entry with sum  of actual and planned rides', () => {
    const list: Gap[] = [
      {
        plannedStartTime: parseTime(new Date('2023-10-04T02:00')),
        actualStartTime: parseTime(new Date('2023-10-04T02:00')),
      },
      {
        plannedStartTime: parseTime(new Date('2023-10-04T02:00')),
        actualStartTime: parseTime(new Date('2023-10-04T02:00')),
      },
    ]
    const [results] = processData(list)
    expect(results).toEqual({
      actual_rides: 2,
      planned_hour: '05:00',
      planned_rides: 2,
    })
  })
})

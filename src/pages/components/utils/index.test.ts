import { Gap, parseTime } from 'src/api/gapsService'
import { convertGapsToHourlyStruct as processData } from 'src/pages/gapsPatterns/useGapsList'
import { HourlyData, mapColorByExecution, sortByMode } from '.'

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
        plannedStartTime: parseTime(new Date('2023-10-04T02:00:00+00:00')),
        actualStartTime: parseTime(new Date('2023-10-04T02:00:00+00:00')),
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
        plannedStartTime: parseTime(new Date('2023-10-04T02:20:00+00:00')),
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
        plannedStartTime: parseTime(new Date('2023-10-04T02:00:00+00:00')),
        actualStartTime: parseTime(new Date('2023-10-04T02:00:00+00:00')),
      },
      {
        plannedStartTime: parseTime(new Date('2023-10-04T02:00:00+00:00')),
        actualStartTime: parseTime(new Date('2023-10-04T02:00:00+00:00')),
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

describe('mapColorByExecution', () => {
  it('returns green when missed rides are exactly 5%', () => {
    expect(mapColorByExecution(100, 95)).toBe('green')
  })

  it('returns orange when missed rides exceed 5%', () => {
    expect(mapColorByExecution(100, 94)).toBe('orange')
  })

  it('returns orange when missed rides are exactly 50%', () => {
    expect(mapColorByExecution(100, 50)).toBe('orange')
  })

  it('returns red when missed rides exceed 50%', () => {
    expect(mapColorByExecution(100, 49)).toBe('red')
  })
})

//import { describe, it, expect } from 'vitest';

import { HourlyData, sortByMode } from '.'

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
})

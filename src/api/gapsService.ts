import moment, { Moment } from 'moment'
import { GapsList } from '../model/gaps'
import { log } from '../log'

type RawGapsList = {
  rides_executed_count: number
  rides_planned_count: number
  rides: {
    siri_time: string
    gtfs_time: string
  }[]
}

const parseTime = (day: Moment, time: string): Moment | undefined =>
  time === 'None' ? undefined : moment(day).add(moment.duration(time))

export const getGapsAsync = async (
  timestamp: Moment,
  operatorId: string,
  lineRef: number,
): Promise<GapsList> => {
  log('Searching for gaps', { operatorId, lineRef })
  const startOfDay = moment(timestamp).startOf('day')
  return EXAMPLE_DATA.rides.map((ride) => ({
    siriTime: parseTime(startOfDay, ride.siri_time),
    gtfsTime: parseTime(startOfDay, ride.gtfs_time),
  }))
}

const EXAMPLE_DATA: RawGapsList = {
  rides_executed_count: 38,
  rides_planned_count: 39,
  rides: [
    {
      siri_time: '05:45',
      gtfs_time: '05:45',
    },
    {
      siri_time: '06:00',
      gtfs_time: '06:00',
    },
    {
      siri_time: '06:20',
      gtfs_time: '06:20',
    },
    {
      siri_time: '06:40',
      gtfs_time: '06:40',
    },
    {
      siri_time: '07:00',
      gtfs_time: '07:00',
    },
    {
      siri_time: '07:20',
      gtfs_time: '07:20',
    },
    {
      siri_time: '07:40',
      gtfs_time: '07:40',
    },
    {
      siri_time: '08:00',
      gtfs_time: '08:00',
    },
    {
      siri_time: '08:20',
      gtfs_time: '08:20',
    },
    {
      siri_time: '09:00',
      gtfs_time: '09:00',
    },
    {
      siri_time: '09:30',
      gtfs_time: '09:30',
    },
    {
      siri_time: '10:00',
      gtfs_time: '10:00',
    },
    {
      siri_time: '10:30',
      gtfs_time: '10:30',
    },
    {
      siri_time: '11:00',
      gtfs_time: '11:00',
    },
    {
      siri_time: '11:30',
      gtfs_time: '11:30',
    },
    {
      siri_time: '12:00',
      gtfs_time: '12:00',
    },
    {
      siri_time: '12:30',
      gtfs_time: '12:30',
    },
    {
      siri_time: '13:00',
      gtfs_time: '13:00',
    },
    {
      siri_time: '13:30',
      gtfs_time: '13:30',
    },
    {
      siri_time: '14:00',
      gtfs_time: '14:00',
    },
    {
      siri_time: '14:20',
      gtfs_time: '14:20',
    },
    {
      siri_time: '14:40',
      gtfs_time: '14:40',
    },
    {
      siri_time: '15:00',
      gtfs_time: '15:00',
    },
    {
      siri_time: '15:20',
      gtfs_time: '15:20',
    },
    {
      siri_time: '15:40',
      gtfs_time: '15:40',
    },
    {
      siri_time: '16:00',
      gtfs_time: '16:00',
    },
    {
      siri_time: '16:20',
      gtfs_time: '16:20',
    },
    {
      siri_time: '16:40',
      gtfs_time: '16:40',
    },
    {
      siri_time: '17:00',
      gtfs_time: '17:00',
    },
    {
      siri_time: '17:20',
      gtfs_time: '17:20',
    },
    {
      siri_time: '17:40',
      gtfs_time: '17:40',
    },
    {
      siri_time: '18:00',
      gtfs_time: '18:00',
    },
    {
      siri_time: '18:30',
      gtfs_time: '18:30',
    },
    {
      siri_time: '19:00',
      gtfs_time: '19:00',
    },
    {
      siri_time: 'None',
      gtfs_time: '19:30',
    },
    {
      siri_time: '20:00',
      gtfs_time: '20:00',
    },
    {
      siri_time: '20:45',
      gtfs_time: '20:45',
    },
    {
      siri_time: '21:30',
      gtfs_time: '21:30',
    },
    {
      siri_time: '22:00',
      gtfs_time: '22:00',
    },
  ],
}

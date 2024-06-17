import moment, { Moment } from 'moment-timezone'
import axios, { CancelTokenSource } from 'axios'
import { GapsList } from '../model/gaps'
import { BASE_PATH } from './apiConfig'

type RawGapsList = {
  planned_start_time: string
  actual_start_time: string
  gtfs_ride_id?: number
}[]
export function parseTime(time: 'null'): null
export function parseTime(time: Exclude<string, 'null'>): Moment

export function parseTime(time: string): Moment | null {
  if (time == 'null') return null

  const utcMoment: Moment = moment.utc(time).tz('Asia/Jerusalem')

  if (!utcMoment.isValid()) return null

  return utcMoment
}

const USE_API = true
const LIMIT = 10000

export const getGapsAsync = async (
  fromTimestamp: Moment,
  toTimestamp: Moment,
  operatorId: string,
  lineRef: number,
  token: CancelTokenSource['token'],
): Promise<GapsList> => {
  const fromDay = moment(fromTimestamp).startOf('day')
  const toDay = moment(toTimestamp).startOf('day')
  // const startOfDay = moment(fromTimestamp).startOf('day')
  const data = USE_API
    ? (
        await axios.get<RawGapsList>(`${BASE_PATH}/rides_execution/list`, {
          params: {
            limit: LIMIT,
            date_from: fromDay.format('YYYY-MM-DD'),
            date_to: toDay.format('YYYY-MM-DD'),
            operator_ref: operatorId,
            line_ref: lineRef,
          },
          cancelToken: token,
        })
      ).data
    : EXAMPLE_DATA
  return data.map((ride) => ({
    gtfs_ride_id: ride.gtfs_ride_id,
    siriTime: parseTime(ride.actual_start_time),
    gtfsTime: parseTime(ride.planned_start_time),
  }))
}

const EXAMPLE_DATA: RawGapsList = [
  {
    actual_start_time: '05:45',
    planned_start_time: '05:45',
  },
  {
    actual_start_time: '06:00',
    planned_start_time: '06:00',
  },
  {
    actual_start_time: '06:20',
    planned_start_time: '06:20',
  },
  {
    actual_start_time: '06:40',
    planned_start_time: '06:40',
  },
  {
    actual_start_time: '07:00',
    planned_start_time: '07:00',
  },
  {
    actual_start_time: '07:20',
    planned_start_time: '07:20',
  },
  {
    actual_start_time: '07:40',
    planned_start_time: '07:40',
  },
  {
    actual_start_time: '08:00',
    planned_start_time: '08:00',
  },
  {
    actual_start_time: '08:20',
    planned_start_time: '08:20',
  },
  {
    actual_start_time: '09:00',
    planned_start_time: '09:00',
  },
  {
    actual_start_time: '09:30',
    planned_start_time: '09:30',
  },
  {
    actual_start_time: '10:00',
    planned_start_time: '10:00',
  },
  {
    actual_start_time: '10:30',
    planned_start_time: '10:30',
  },
  {
    actual_start_time: '11:00',
    planned_start_time: '11:00',
  },
  {
    actual_start_time: '11:30',
    planned_start_time: '11:30',
  },
  {
    actual_start_time: '12:00',
    planned_start_time: '12:00',
  },
  {
    actual_start_time: '12:30',
    planned_start_time: '12:30',
  },
  {
    actual_start_time: '13:00',
    planned_start_time: '13:00',
  },
  {
    actual_start_time: '13:30',
    planned_start_time: '13:30',
  },
  {
    actual_start_time: '14:00',
    planned_start_time: '14:00',
  },
  {
    actual_start_time: '14:20',
    planned_start_time: '14:20',
  },
  {
    actual_start_time: '14:40',
    planned_start_time: '14:40',
  },
  {
    actual_start_time: '15:00',
    planned_start_time: '15:00',
  },
  {
    actual_start_time: '15:20',
    planned_start_time: '15:20',
  },
  {
    actual_start_time: '15:40',
    planned_start_time: '15:40',
  },
  {
    actual_start_time: '16:00',
    planned_start_time: '16:00',
  },
  {
    actual_start_time: '16:20',
    planned_start_time: '16:20',
  },
  {
    actual_start_time: '16:40',
    planned_start_time: '16:40',
  },
  {
    actual_start_time: '17:00',
    planned_start_time: '17:00',
  },
  {
    actual_start_time: '17:20',
    planned_start_time: '17:20',
  },
  {
    actual_start_time: '17:40',
    planned_start_time: '17:40',
  },
  {
    actual_start_time: '18:00',
    planned_start_time: '18:00',
  },
  {
    actual_start_time: '18:30',
    planned_start_time: '18:30',
  },
  {
    actual_start_time: '19:00',
    planned_start_time: '19:00',
  },
  {
    actual_start_time: 'None',
    planned_start_time: '19:30',
  },
  {
    actual_start_time: '20:00',
    planned_start_time: '20:00',
  },
  {
    actual_start_time: '20:45',
    planned_start_time: '20:45',
  },
  {
    actual_start_time: '21:30',
    planned_start_time: '21:30',
  },
  {
    actual_start_time: '22:00',
    planned_start_time: '22:00',
  },
]

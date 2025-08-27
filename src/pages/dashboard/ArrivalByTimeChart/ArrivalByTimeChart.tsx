import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './ArrivalByTimeChats.scss'
import dayjs from 'src/dayjs'

/**
 * Group array items by a common property value returned from the callback (ie. group by value of id).
 * @param array Data array
 * @param callback A callback that returns a group name
 * @returns New grouped array
 */
export const arrayGroup = function <T>(array: T[], callback: (item: T) => string) {
  const groups: Record<string, T[]> = {}
  array.forEach(function (item) {
    const groupName = callback(item)
    groups[groupName] = groups[groupName] || []
    groups[groupName].push(item)
  })
  return Object.keys(groups).map(function (group) {
    return groups[group]
  })
}

/**
 * Creates an ISO string array between 2 points guided by an interval.
 * @param start ISO string (included)
 * @param end ISO string (excluded)
 * @param interval hour | day
 * @returns an array filled with dates from start to end (excluded)
 */
export const getRange = (start: string, end: string, interval: 'hour' | 'day') => {
  const startTime = new Date(start),
    endTime = new Date(end)
  const interval_ms = (interval == 'hour' ? 1 : 24) * 60 * 60 * 1000
  const result = new Array((endTime.getTime() - startTime.getTime()) / interval_ms)
    .fill(null)
    .map((_, i) => new Date(startTime.getTime() + i * interval_ms).toISOString())
  return result
}

export default function ArrivalByTimeChart({
  data,
  operatorId,
}: {
  data: {
    id: string
    name: string
    current: number
    max: number
    percent: number | null
    gtfs_route_date?: string
    gtfs_route_hour?: string
  }[]
  operatorId: string
}) {
  if (operatorId) data = data.filter((item) => item.id === operatorId)
  const dataByOperator = useMemo(() => {
    const allTimes = data
      .map((item) => item.gtfs_route_date ?? item.gtfs_route_hour!)
      .filter(Boolean)
    if (allTimes.length === 0) return []
    const minTime = allTimes.reduce((a, b) => (a < b ? a : b))
    const maxTime = allTimes.reduce((a, b) => (a > b ? a : b))
    const allRange = getRange(minTime, maxTime, data[0].gtfs_route_hour ? 'hour' : 'day')

    const pointsPerOperator = arrayGroup(data, (item) => item.id).map((operatorData) => {
      return allRange.map((time) => {
        const current = operatorData.find(
          (item) =>
            time.includes(item.gtfs_route_date!.split('T')[0]) ||
            time.includes(item.gtfs_route_hour!),
        )
        return {
          id: operatorData[0].id,
          name: operatorData[0].name,
          current: current?.current || 0,
          max: current?.max || 0,
          percent: current ? (current.current / current.max) * 100 : null,
          ...(data[0]?.gtfs_route_hour ? { gtfs_route_hour: time } : { gtfs_route_date: time }),
        }
      })
    })

    return pointsPerOperator.filter((operator) => operator.reduce((a, b) => a + b.current, 0) > 1) // filter out operators with no data
  }, [data])

  return (
    <div className="chart">
      {dataByOperator.map((operatorData) => (
        <div key={operatorData[0].name}>
          <h3 className="title">{operatorData[0].name}</h3>
          <ResponsiveContainer debounce={1000} height={300}>
            <LineChart
              data={operatorData}
              margin={{
                right: 35,
              }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={
                  'gtfs_route_date' in operatorData[0] ? 'gtfs_route_date' : 'gtfs_route_hour'
                }
                tickFormatter={(tick: dayjs.ConfigType) => dayjs(tick).format('dddd')}
                interval={'gtfs_route_hour' in operatorData[0] ? 23 : 0}
              />
              <YAxis domain={[0, 100]} tickMargin={35} unit={'%'} />
              <Tooltip
                content={({ payload }) =>
                  payload?.[0] ? (
                    <>
                      <ul>
                        <li>
                          <span className="label">זמן: </span>
                          <span className="value">
                            {payload[0].payload.gtfs_route_date
                              ? dayjs
                                  .utc(payload[0].payload.gtfs_route_date as dayjs.ConfigType)
                                  .format('יום ddd, L')
                              : dayjs(
                                  payload[0].payload.gtfs_route_hour as dayjs.ConfigType,
                                ).format('יום ddd, L, LT')}
                          </span>
                        </li>
                        <li>
                          <span className="label">ביצוע: </span>
                          <span className="value">{payload[0].payload.current}</span>
                        </li>
                        <li>
                          <span className="label">תכנון: </span>
                          <span className="value">{payload[0].payload.max}</span>
                        </li>
                        <li>
                          <span className="label">דיוק: </span>
                          <span className="value">
                            {((payload[0].payload.current / payload[0].payload.max) * 100).toFixed(
                              2,
                            )}
                            %
                          </span>
                        </li>
                      </ul>
                    </>
                  ) : null
                }
              />
              <Line type="monotone" dataKey="percent" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}

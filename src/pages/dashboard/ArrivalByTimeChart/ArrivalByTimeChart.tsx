import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import './ArrivalByTimeChats.scss'
import { useMemo } from 'react'
import moment from 'moment'

export const arrayGroup = function <T>(array: T[], f: (item: T) => string) {
  const groups: Record<string, T[]> = {}
  array.forEach(function (o) {
    const group = f(o)
    groups[group] = groups[group] || []
    groups[group].push(o)
  })
  return Object.keys(groups).map(function (group) {
    return groups[group]
  })
}

// create a range of dates between min and max
const getRange = (start: string, end: string, interval: 'hour' | 'day') => {
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
    // iso string, can be sorted. TODO: better type definitions
    gtfs_route_date?: string
    gtfs_route_hour?: string
  }[]
  operatorId: string
}) {
  if (operatorId) data = data.filter((item) => item.id === operatorId)
  const dataByOperator = useMemo(() => {
    // find the min and max time, to create a range of dates / hours for the x axis
    const times = data.map((item) => item.gtfs_route_date ?? item.gtfs_route_hour!).filter(Boolean)
    if (times.length === 0) return []
    const minTime = times.reduce((a, b) => (a < b ? a : b))
    const maxTime = times.reduce((a, b) => (a > b ? a : b))

    const range = getRange(minTime, maxTime, data[0].gtfs_route_hour ? 'hour' : 'day')

    const pointsPerOperator = arrayGroup(data, (item) => item.id).map((operatorData) => {
      return range.map((time) => {
        const current = operatorData.find(
          (item) => time.includes(item.gtfs_route_date!) || time.includes(item.gtfs_route_hour!),
        )
        return {
          id: operatorData[0].id,
          name: operatorData[0].name,
          current: current?.current || 0,
          max: current?.max || 0,
          percent: current ? (current.current / current.max) * 100 : null,
          ...(data[0]?.gtfs_route_hour ? { gtfs_route_hour: time } : { gtfs_route_date: time }),
          time,
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
                tickFormatter={(tick) => moment(tick).format('dddd')}
                interval={'gtfs_route_hour' in operatorData[0] ? 23 : 0}
              />
              <YAxis domain={[0, 100]} tickMargin={35} unit={'%'} />
              <Tooltip
                content={({ payload }) =>
                  payload?.[0] && (
                    <>
                      <ul>
                        <li>
                          <span className="label">זמן: </span>
                          <span className="value">
                            {payload[0].payload.gtfs_route_date
                              ? moment.utc(payload[0].payload.gtfs_route_date).format('יום ddd, L')
                              : moment(payload[0].payload.gtfs_route_hour).format('יום ddd, L, LT')}
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
                  )
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

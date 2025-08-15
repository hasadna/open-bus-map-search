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
import dayjs from 'src/dayjs'
import './ArrivalByTimeChats.scss'

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

export type ArrivalByTimeData = {
  operatorId: string
  name: string
  current: number
  max: number
  percent: number
  gtfsRouteDate: string
  gtfsRouteHour: string
}

export default function ArrivalByTimeChart({
  data,
  operatorId,
}: {
  data: ArrivalByTimeData[]
  operatorId: string
}) {
  const filteredData = useMemo(() => {
    if (!operatorId) return data
    return data.filter((item) => item.operatorId === operatorId)
  }, [data, operatorId])

  const dataByOperator = useMemo(() => {
    const allTimes = filteredData
      .map((item) => item.gtfsRouteDate ?? item.gtfsRouteHour)
      .filter(Boolean)

    if (allTimes.length === 0) return []

    const minTime = allTimes.reduce((a, b) => (a < b ? a : b))
    const maxTime = allTimes.reduce((a, b) => (a > b ? a : b))
    const allRange = getRange(minTime, maxTime, data[0].gtfsRouteDate ? 'hour' : 'day')

    const pointsPerOperator = arrayGroup(filteredData, (item) => item.operatorId).map(
      (operatorData) => {
        return allRange
          .map((time) => {
            const current = operatorData.find((item) =>
              item.gtfsRouteDate
                ? time.includes(item.gtfsRouteDate)
                : time.includes(item.gtfsRouteHour || ''),
            )
            if (!current) return undefined
            return {
              id: operatorData[0].operatorId,
              name: operatorData[0].name,
              current: current.current,
              max: current.max,
              percent: current.percent,
            }
          })
          .filter((c) => c !== undefined)
      },
    )

    return pointsPerOperator.filter(
      (operator) => operator.reduce((sum, point) => sum + point.current, 0) > 0,
    )
  }, [filteredData])

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
                dataKey={'gtfsRouteDate' in operatorData[0] ? 'gtfsRouteDate' : 'gtfsRouteHour'}
                tickFormatter={(tick: dayjs.ConfigType) => dayjs(tick).format('dddd')}
                interval={'gtfsRouteHour' in operatorData[0] ? 23 : 0}
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
                            {payload[0].payload.gtfsRouteDate
                              ? dayjs
                                  .utc(payload[0].payload.gtfsRouteDate as dayjs.ConfigType)
                                  .format('יום ddd, L')
                              : dayjs(payload[0].payload.gtfsRouteHour as dayjs.ConfigType).format(
                                  'יום ddd, L, LT',
                                )}
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

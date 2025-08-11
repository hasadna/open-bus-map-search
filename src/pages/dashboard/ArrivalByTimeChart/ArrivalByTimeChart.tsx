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
import { GroupByRes } from 'src/api/groupByService'

export function arrayGroup<T>(array: T[], callback: (item: T) => string): T[][] {
  return Object.values(
    array.reduce<Record<string, T[]>>((acc, item) => {
      const key = callback(item)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {}),
  )
}

export const getRange = (startTime: Date, endTime: Date, interval: 'hour' | 'day') => {
  const intervalMs = (interval === 'hour' ? 1 : 24) * 60 * 60 * 1000
  const result = []
  for (let t = startTime.getTime(); t <= endTime.getTime(); t += intervalMs) {
    result.push(new Date(t).toISOString())
  }
  return result
}

export default function ArrivalByTimeChart({
  data,
  operatorId,
}: {
  data: GroupByRes[]
  operatorId: string
}) {
  const filteredData = useMemo(() => {
    if (operatorId) {
      return data.filter((item) => item.operatorRef?.operatorRef.toString() === operatorId)
    }
    return data
  }, [data, operatorId])

  const dataByOperator = useMemo(() => {
    if (!filteredData.length) return []
    const isByHour = !!filteredData[0]?.gtfsRouteHour
    const allTimes = filteredData
      .map((item) => new Date(isByHour ? item.gtfsRouteHour! : item.gtfsRouteDate!))
      .filter((time) => time !== undefined)

    if (!allTimes.length) return []
    const minTime = allTimes.reduce((a, b) => (a.valueOf() < b.valueOf() ? a : b))
    const maxTime = allTimes.reduce((a, b) => (a.valueOf() > b.valueOf() ? a : b))

    const allRange = getRange(minTime, maxTime, isByHour ? 'hour' : 'day')

    const grouped = arrayGroup(
      filteredData,
      (item) => item.operatorRef?.operatorRef?.toString() || '',
    )
    const pointsPerOperator = grouped.map((operatorData) => {
      return allRange
        .map((time) => {
          const current = operatorData.find((item) => {
            const dateStr = item.gtfsRouteDate?.toString()
            const hourStr = item.gtfsRouteHour?.toString()
            return time === dateStr || time === hourStr
          })

          const planned = current?.totalPlannedRides
          const actual = current?.totalActualRides

          return {
            id: operatorData[0]?.operatorRef?.operatorRef,
            name: operatorData[0]?.operatorRef?.agencyName,
            current: actual,
            max: planned,
            percent: planned && actual ? (actual / planned) * 100 : null,
            ...(isByHour ? { gtfsRouteHour: time } : { gtfsRouteDate: time }),
          }
        })
        .filter((d) => d.percent)
    })

    return pointsPerOperator.filter(
      (operator) => operator.reduce((sum, point) => sum + (point.current || 0), 0) > 0,
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

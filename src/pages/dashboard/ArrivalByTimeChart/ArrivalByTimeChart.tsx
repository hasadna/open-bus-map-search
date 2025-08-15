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
import Widget from 'src/shared/Widget'
import { InfoItem, InfoTable } from 'src/pages/components/InfoTable'

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
  const interval_ms = (interval === 'hour' ? 1 : 24) * 60 * 60 * 1000
  const result: string[] = []
  let current = startTime.getTime()

  while (current <= endTime.getTime()) {
    result.push(new Date(current).toISOString())
    current += interval_ms
  }
  return result
}

export type ArrivalByTimeData = {
  operatorId: string
  name: string
  current: number
  max: number
  percent: number
  gtfsRouteDate?: Date
  gtfsRouteHour?: Date
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
    const groupedByHour = !!data[0].gtfsRouteHour

    const allTimes = filteredData
      .map((item) => (groupedByHour ? item.gtfsRouteHour : item.gtfsRouteDate))
      .filter((date) => date !== undefined)

    if (allTimes.length === 0) return []

    let minTime = allTimes[0]
    let maxTime = allTimes[0]

    for (const date of allTimes) {
      if (date < minTime) minTime = date
      if (date > maxTime) maxTime = date
    }

    const allRange = getRange(minTime, maxTime, groupedByHour ? 'hour' : 'day')

    const pointsPerOperator = arrayGroup(filteredData, (item) => item.operatorId).map(
      (operatorData) => {
        return allRange
          .map((time) => {
            const current = operatorData.find((item) => {
              const date = groupedByHour ? item.gtfsRouteHour! : item.gtfsRouteDate!

              return time.includes(date?.toISOString())
            })

            if (!current) return undefined
            return {
              id: current.operatorId,
              name: current.name,
              current: current.current,
              max: current.max,
              percent: current.percent,
              [groupedByHour ? 'gtfsRouteHour' : 'gtfsRouteDate']: time,
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
                    <Widget>
                      <InfoTable>
                        <InfoItem
                          label="זמן"
                          value={dayjs(
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            payload[0].payload.gtfsRouteHour
                              ? payload[0].payload.gtfsRouteHour
                              : payload[0].payload.gtfsRouteDate,
                          ).format(
                            payload[0].payload.gtfsRouteHour ? 'HH:mm-DD/MM/YY' : 'DD/MM/YY',
                          )}
                        />
                        <InfoItem label="ביצוע" value={payload[0].payload.current} />
                        <InfoItem label="תכנון" value={payload[0].payload.max} />
                        <InfoItem
                          label="דיוק"
                          value={`${payload[0].payload.percent.toFixed(2)}%`}
                        />
                      </InfoTable>
                    </Widget>
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

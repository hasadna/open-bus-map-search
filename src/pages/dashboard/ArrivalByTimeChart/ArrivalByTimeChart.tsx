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
import moment from 'moment-timezone'

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
    gtfs_route_date: string
    gtfs_route_hour: string
  }[]
  operatorId: string
}) {
  data = useMemo(() => {
    let newData = data.filter((item) => !operatorId || item.id === operatorId)
    if (newData[0]?.gtfs_route_hour) {
      const lastId = parseInt(newData[newData.length - 1].id)
      const fillerArray = []
      for (let currentId = 0; currentId <= lastId; currentId++) {
        const allPoints = newData
          .filter((e) => parseInt(e.id) === currentId)
          .sort((a, b) => (moment(a.gtfs_route_hour).isAfter(b.gtfs_route_hour) ? 1 : -1))
        if (allPoints[0]) {
          // Start gap
          for (
            let startHour = moment(allPoints[0].gtfs_route_hour).hour();
            startHour > 0;
            startHour--
          ) {
            fillerArray.push({
              ...allPoints[0],
              max: 0,
              current: 0,
              percent: null,
              gtfs_route_hour: moment(allPoints[0].gtfs_route_hour)
                .subtract(startHour, 'hours')
                .toISOString(),
            })
          }
          // During gap
          let lastHour = allPoints[0].gtfs_route_hour
          allPoints.forEach((entry) => {
            for (
              let delta = moment(entry.gtfs_route_hour).diff(moment(lastHour), 'hours');
              delta > 1;
              delta--
            ) {
              const currentHour = moment(lastHour).add(1, 'hours').local().toISOString()
              fillerArray.push({
                ...entry,
                percent: null,
                current: 0,
                max: 0,
                gtfs_route_hour: currentHour,
              })
              lastHour = currentHour
            }
            lastHour = entry.gtfs_route_hour
          })
        }
      }
      newData = newData.concat(fillerArray)
    }
    return newData
  }, [data, operatorId])
  return (
    <div className="chart">
      {arrayGroup(data, (item) => item.id)
        .filter((group) => group.length > 1 && group.reduce((a, b) => a + b.current, 0) > 1)
        .map((group) => (
          <div key={group[0].name}>
            <h3 className="title">{group[0].name}</h3>
            <ResponsiveContainer debounce={1000} height={300}>
              <LineChart
                data={group.sort((a, b) => {
                  const sortBy = group[0].gtfs_route_hour ? 'gtfs_route_hour' : 'gtfs_route_date'
                  return moment(a[sortBy]).isAfter(moment(b[sortBy])) ? 1 : -1
                })}
                margin={{
                  right: 35,
                }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={group[0].gtfs_route_date ? 'gtfs_route_date' : 'gtfs_route_hour'}
                  tickFormatter={(tick) => moment(tick).format('dddd')}
                  interval={group[0].gtfs_route_hour ? 23 : 0}
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
                                ? moment
                                    .utc(payload[0].payload.gtfs_route_date)
                                    .format('יום ddd, L')
                                : moment(payload![0].payload.gtfs_route_hour).format('L, LT')}
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
                              {(
                                (payload[0].payload.current / payload[0].payload.max) *
                                100
                              ).toFixed(2)}
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

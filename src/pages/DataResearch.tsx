import React, { useMemo } from 'react'
import { useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'
import { useDate } from './components/DateTimePicker'
import moment from 'moment'
import { Grid } from '@mui/material'
import { DateSelector } from './components/DateSelector'
import { useTranslation } from 'react-i18next'
import { Skeleton } from 'antd'
import {
  Area,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { PageContainer } from './components/PageContainer'
import { getColorName } from './dashboard/AllLineschart/OperatorHbarChart/OperatorHbarChart'

const now = moment()
const unique: (value: string, index: number, self: string[]) => boolean = (value, index, self) =>
  self.indexOf(value) === index

export const DataResearch = () => {
  return (
    <PageContainer>
      <h1>מחקרים</h1>
      <StackedResearchChart />
    </PageContainer>
  )
}

export const StackedResearchChart = () => {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const [groupByHour, setGroupByHour] = React.useState<boolean>(false)
  const { t } = useTranslation()

  const [graphData, loadingGraph] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

  const data = useMemo(
    () =>
      graphData.reduce((acc, curr) => {
        if (curr.total_actual_rides === 0) return acc
        const date = curr.gtfs_route_date ?? curr.gtfs_route_hour
        const entry = acc.find((item) => item.date === date)
        if (entry) {
          entry[curr.operator_ref?.agency_name || 'Unknown'] = curr.total_actual_rides
        } else {
          const newEntry = {
            date: date,
            [curr.operator_ref?.agency_name || 'Unknown']: curr.total_actual_rides,
          }
          acc.push(newEntry)
        }
        return acc
      }, [] as Record<string, string | number>[]),
    [graphData],
  )

  const operators = graphData
    .map((operator) => operator.operator_ref?.agency_name || 'Unknown')
    .filter(unique)

  return (
    <Widget>
      <h2>בעיות etl/gps/משהו גלובאלי אחר</h2>
      <p>אם יש לכם רעיון מעניין למה קורים פה דברים, דברו איתנו בסלאק!</p>
      <Grid container>
        <Grid xs={6} item>
          <DateSelector
            time={startDate}
            onChange={(data) => setStartDate(data)}
            customLabel={t('start')}
          />
        </Grid>
        <Grid xs={6} item>
          <DateSelector
            time={endDate}
            onChange={(data) => setEndDate(data)}
            customLabel={t('end')}
          />
        </Grid>
      </Grid>
      <label>
        <input
          type="checkbox"
          checked={groupByHour}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupByHour(e.target.checked)}
        />
        {t('group_by_hour_tooltip_content')}
      </label>
      {loadingGraph ? (
        <Skeleton active />
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight="500px">
          <AreaChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            {operators.map((operator) => (
              <Area
                type="monotone"
                dataKey={operator}
                key={operator}
                stackId="1"
                stroke={getColorName(operator)}
                fill={getColorName(operator)}
              />
            ))}
            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Widget>
  )
}

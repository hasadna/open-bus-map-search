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
      <Widget>
        <h1>מחקרים</h1>
        <p>אם יש לכם רעיון מעניין למה קורים פה דברים, דברו איתנו בסלאק!</p>
      </Widget>
      <StackedResearchSection />
    </PageContainer>
  )
}

function StackedResearchSection() {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const [groupByHour, setGroupByHour] = React.useState<boolean>(false)
  const [graphData, loadingGraph] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

  return (
    <Widget>
      <h1>בעיות etl/gps/משהו גלובאלי אחר</h1>
      <StackedResearchInputs
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        groupByHour={groupByHour}
        setGroupByHour={setGroupByHour}
      />
      <StackedResearchChart
        graphData={graphData}
        isLoading={loadingGraph}
        field="total_actual_rides"
        title="מספר נסיעות בפועל"
        description="כמה נסיעות נרשמו כהתבצעו בכל יום/שעה בטווח הזמן שבחרתם. (נסיעות = siri rides)"
      />
      <StackedResearchChart
        graphData={graphData}
        isLoading={loadingGraph}
        field="total_planned_rides"
        title="מספר נסיעות מתוכננות"
        description="כמה נסיעות היו אמורות להיות בכל יום/שעה בטווח הזמן שבחרתם. (נסיעות = נסיעות מתוכננות בgtfs)"
      />
      <StackedResearchChart
        graphData={graphData}
        isLoading={loadingGraph}
        field="total_missed_rides"
        title="מספר נסיעות שלא התבצעו"
        description="כמה נסיעות היו אמורות להיות בכל יום/שעה בטווח הזמן שבחרתם אבל לא התבצעו. (הפרש בין שני הגרפים הקודמים)"
      />
    </Widget>
  )
}

function StackedResearchInputs({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  groupByHour,
  setGroupByHour,
}: {
  startDate: moment.Moment
  setStartDate: (date: moment.Moment) => void
  endDate: moment.Moment
  setEndDate: (date: moment.Moment) => void
  groupByHour: boolean
  setGroupByHour: (value: boolean) => void
}) {
  const { t } = useTranslation()
  return (
    <>
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
    </>
  )
}

const StackedResearchChart = ({
  graphData,
  isLoading,
  title,
  description,
  field = 'total_actual_rides',
}: {
  graphData: {
    gtfs_route_date: string
    gtfs_route_hour: string
    operator_ref?: {
      agency_name?: string
    }
    total_actual_rides: number
    total_planned_rides: number
  }[]
  isLoading?: boolean
  title?: string
  description?: string
  field?: 'total_actual_rides' | 'total_planned_rides' | 'total_missed_rides'
}) => {
  const data = useMemo(
    () =>
      graphData
        .reduce((acc, curr) => {
          const val =
            field === 'total_missed_rides'
              ? curr.total_planned_rides - curr.total_actual_rides
              : curr[field]
          const date = curr.gtfs_route_date ?? curr.gtfs_route_hour
          const entry = acc.find((item) => item.date === date)
          if (entry) {
            if (val) entry[curr.operator_ref?.agency_name || 'Unknown'] = val
          } else {
            const newEntry = {
              date: date,
              [curr.operator_ref?.agency_name || 'Unknown']: val,
            }
            acc.push(newEntry)
          }
          return acc
        }, [] as Record<string, string | number>[])
        .sort((a, b) => {
          if (a.date > b.date) return 1
          if (a.date < b.date) return -1
          return 0
        }),
    [graphData],
  )

  const operators = graphData
    .map((operator) => operator.operator_ref?.agency_name || 'Unknown')
    .filter(unique)

  return (
    <>
      {title && <h2>{title}</h2>}
      {description && (
        <p>
          <strong>מה רואים בגרף?</strong>
          <br />
          {description}
        </p>
      )}
      {isLoading ? (
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
    </>
  )
}

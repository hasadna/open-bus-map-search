import { Grid } from '@mui/material'
import { Skeleton } from 'antd'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DateSelector } from '../components/DateSelector'
import { useDate } from '../components/DateTimePicker'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import { getColorName } from '../dashboard/AllLineschart/OperatorHbarChart/OperatorHbarChart'
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import Widget from 'src/shared/Widget'
import dayjs from 'src/dayjs'
import './DataResearch.scss'

const now = dayjs()
const unique: (value: string, index: number, self: string[]) => boolean = (value, index, self) =>
  self.indexOf(value) === index

export const DataResearch = () => {
  return (
    <PageContainer>
      <Widget title="מחקרים">
        <p>אם יש לכם רעיון מעניין למה קורים פה דברים, דברו איתנו בסלאק!</p>
      </Widget>
      <StackedResearchSection />
    </PageContainer>
  )
}

function StackedResearchSection() {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const [operatorId, setOperatorId] = useState<number>()
  const [groupByHour, setGroupByHour] = useState<boolean>(false)
  const [graphData, loadingGraph] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

  return (
    <Widget title="בעיות etl/gps/משהו גלובאלי אחר" marginBottom>
      <StackedResearchInputs
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        groupByHour={groupByHour}
        setGroupByHour={setGroupByHour}
        operatorId={operatorId}
        setOperatorId={setOperatorId}
      />
      <StackedResearchChart
        graphData={graphData}
        isLoading={loadingGraph}
        field="totalActualRides"
        title="מספר נסיעות בפועל"
        description="כמה נסיעות נרשמו כהתבצעו בכל יום/שעה בטווח הזמן שבחרתם. (נסיעות = siri rides)"
        agencyId={operatorId}
      />
      <StackedResearchChart
        graphData={graphData}
        isLoading={loadingGraph}
        field="totalPlannedRides"
        title="מספר נסיעות מתוכננות"
        description="כמה נסיעות היו אמורות להיות בכל יום/שעה בטווח הזמן שבחרתם. (נסיעות = נסיעות מתוכננות בgtfs)"
        agencyId={operatorId}
      />
      <StackedResearchChart
        graphData={graphData}
        isLoading={loadingGraph}
        field="totalMissedRides"
        title="מספר נסיעות שלא התבצעו"
        description="כמה נסיעות היו אמורות להיות בכל יום/שעה בטווח הזמן שבחרתם אבל לא התבצעו. (הפרש בין שני הגרפים הקודמים)"
        agencyId={operatorId}
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
  operatorId,
  setOperatorId,
}: {
  startDate: dayjs.Dayjs
  setStartDate: (date: dayjs.Dayjs) => void
  endDate: dayjs.Dayjs
  setEndDate: (date: dayjs.Dayjs) => void
  groupByHour: boolean
  setGroupByHour: (value: boolean) => void
  operatorId?: number
  setOperatorId: (value?: number) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <Grid container gap={2}>
        <Grid size={{ md: 'grow', xs: 12 }}>
          <DateSelector
            time={startDate}
            onChange={(data) => data && setStartDate(data)}
            customLabel={t('start')}
          />
        </Grid>
        <Grid size={{ md: 'grow', xs: 12 }}>
          <DateSelector
            time={endDate}
            onChange={(data) => data && setEndDate(data)}
            customLabel={t('end')}
          />
        </Grid>
        <OperatorSelector operatorId={operatorId} setOperatorId={setOperatorId} />
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
  field = 'totalActualRides',
  agencyId,
}: {
  graphData: GroupByRes[]
  isLoading?: boolean
  title?: string
  description?: string
  field?: 'totalActualRides' | 'totalPlannedRides' | 'totalMissedRides'
  agencyId?: number
}) => {
  const filteredGraphData = agencyId
    ? graphData
    : graphData.filter((dataRecord) => dataRecord.operatorRef?.agencyName === agencyId?.toString())
  const data = useMemo(
    () =>
      filteredGraphData
        .reduce(
          (acc, curr) => {
            const val =
              field === 'totalMissedRides'
                ? curr.totalPlannedRides - curr.totalActualRides
                : curr[field]
            const date = (curr.gtfsRouteDate ?? curr.gtfsRouteHour)?.valueOf() ?? 0
            const agencyName = curr.operatorRef?.agencyName || 'Unknown'
            const entry = acc.find((item) => item.date === date)

            if (entry) {
              entry[agencyName] = val
            } else {
              const newEntry: Record<string, number> = {
                date,
                agencyName: val,
              }
              acc.push(newEntry)
            }
            return acc
          },
          [] as Record<string, number>[],
        )
        .sort((a, b) => {
          if (a.date > b.date) return 1
          if (a.date < b.date) return -1
          return 0
        }),
    [filteredGraphData],
  )

  const operators = filteredGraphData
    .map((operator) => operator.operatorRef?.agencyName || 'Unknown')
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

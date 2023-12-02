import { useState } from 'react'

// Services and libraries
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import { DateSelector } from '../components/DateSelector'
import { useDate } from '../components/DateTimePicker'
import moment from 'moment'

// Styling
import './DashboardPage.scss'
import { PageContainer } from '../components/PageContainer'
import { TEXTS } from 'src/resources/texts'
import { Skeleton, Typography } from 'antd'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2

// Components
import OperatorSelector from 'src/pages/components/OperatorSelector'
import LinesHbarChart from './LineHbarChart/LinesHbarChart'
import DayTimeChart from './ArrivalByTimeChart/DayTimeChart'
import AllLinesChart from './AllLineschart/AllLinesChart'

// Declarations
const { Title } = Typography
const now = moment()

const convertToWorstLineChartCompatibleStruct = (arr: GroupByRes[], operatorId: string) => {
  if (!arr || !arr.length) return []
  return arr
    .filter((row: GroupByRes) => row.operator_ref?.agency_id === operatorId || !Number(operatorId))
    .map((item: GroupByRes) => ({
      id: `${item.line_ref}|${item.operator_ref?.agency_id}` || 'Unknown',
      operator_name: item.operator_ref?.agency_name || 'Unknown',
      short_name: JSON.parse(item.route_short_name)[0],
      long_name: item.route_long_name,
      total: item.total_planned_rides,
      actual: item.total_actual_rides,
    }))
}

const DashboardPage = () => {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const [operatorId, setOperatorId] = useState('')
  const [groupByLineData, lineDataLoading] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: 'operator_ref,line_ref',
  })

  return (
    <PageContainer>
      <Title level={3}>ביצועי תחבורה ציבורית</Title>
      <Grid
        container
        spacing={2}
        alignItems="center"
        sx={{ marginTop: '0px' }}
        justifyContent="space-between">
        <Grid lg={6} xs={12} container spacing={2} alignItems="center">
          <Grid xs={6}>
            <DateSelector
              time={startDate}
              onChange={(data) => setStartDate(data)}
              customLabel={TEXTS.start}
            />
          </Grid>
          <Grid xs={6}>
            <DateSelector
              time={endDate}
              onChange={(data) => setEndDate(data)}
              customLabel={TEXTS.end}
            />
          </Grid>
        </Grid>

        <Grid lg={6} display={{ xs: 'none', lg: 'block' }}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={setOperatorId}
            onlyMajorOperators
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid xs={12} lg={6}>
          <AllLinesChart startDate={startDate} endDate={endDate} />
        </Grid>
        <Grid xs={12} display={{ xs: 'block', lg: 'none' }}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={setOperatorId}
            onlyMajorOperators
          />
        </Grid>
        <Grid xs={12} lg={6}>
          <div className="widget">
            <h2 className="title">{TEXTS.worst_lines_page_title}</h2>
            {lineDataLoading ? (
              <Skeleton active />
            ) : (
              <LinesHbarChart
                lines={convertToWorstLineChartCompatibleStruct(groupByLineData, operatorId)}
                operators_whitelist={['אלקטרה אפיקים', 'דן', 'מטרופולין', 'קווים', 'אגד']}
              />
            )}
          </div>
        </Grid>
        <Grid xs={12}>
          <DayTimeChart />
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default DashboardPage

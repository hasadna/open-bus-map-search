import { useState } from 'react'

// Services and libraries
import { DateSelector } from '../components/DateSelector'
import { useDate } from '../components/DateTimePicker'
import moment from 'moment'

// Styling
import './DashboardPage.scss'
import { PageContainer } from '../components/PageContainer'
import { TEXTS } from 'src/resources/texts'
import { Typography } from 'antd'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2

// Components
import OperatorSelector from 'src/pages/components/OperatorSelector'
import DayTimeChart from './ArrivalByTimeChart/DayTimeChart'
import AllLinesChart from './AllLineschart/AllLinesChart'
import WorstLinesChart from './WorstLinesChart/WorstLinesChart'

// Declarations
const { Title } = Typography
const now = moment()

const DashboardPage = () => {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const [operatorId, setOperatorId] = useState('')

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
          <WorstLinesChart startDate={startDate} endDate={endDate} operatorId={operatorId} />
        </Grid>
        <Grid xs={12}>
          <DayTimeChart startDate={startDate} endDate={endDate} />
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default DashboardPage

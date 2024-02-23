import { useState } from 'react'

// Services and libraries
import { DateSelector } from '../components/DateSelector'
import { useDate } from '../components/DateTimePicker'
import moment from 'moment'

// Styling
import './DashboardPage.scss'
import 'src/App.scss'
import { PageContainer } from '../components/PageContainer'
import { useTranslation } from 'react-i18next'
import { Alert, Typography } from 'antd'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2

// Components
import OperatorSelector, { FilterOperatorOptions } from 'src/pages/components/OperatorSelector'
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
  const { t } = useTranslation()

  return (
    <PageContainer>
      <Title className="page-title" level={3}>
        ביצועי תחבורה ציבורית
      </Title>
      <Alert message="תפקוד תחבורה ציבורית לפי פרמטרים שונים" type="info" />
      {startDate > endDate ? (
        <Alert closable showIcon message={t('bug_date_alert')} type="error" />
      ) : null}
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
              customLabel={t('start')}
            />
          </Grid>
          <Grid xs={6}>
            <DateSelector
              time={endDate}
              onChange={(data) => setEndDate(data)}
              minDate={startDate}
              customLabel={t('end')}
            />
          </Grid>
        </Grid>

        <Grid lg={6} xs={12}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={setOperatorId}
            filter={FilterOperatorOptions.MAJOR}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid xs={12} lg={6} className="widget">
          <AllLinesChart startDate={startDate} endDate={endDate} />
        </Grid>
        <Grid xs={12} lg={6} className="widget">
          <WorstLinesChart startDate={startDate} endDate={endDate} operatorId={operatorId} />
        </Grid>
        <Grid xs={12} className="widget">
          <DayTimeChart startDate={startDate} endDate={endDate} operatorId={operatorId} />
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default DashboardPage

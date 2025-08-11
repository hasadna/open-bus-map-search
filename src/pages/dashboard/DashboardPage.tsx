import { useState } from 'react'

// Styling
import './DashboardPage.scss'
import { useTranslation } from 'react-i18next'
import { Typography, Alert, Grid } from '@mui/material'
import { useDate } from '../components/DateTimePicker'
import { DateSelector } from '../components/DateSelector'
import { PageContainer } from '../components/PageContainer'

// Components
import InfoYoutubeModal from '../components/YoutubeModal'
import DayTimeChart from './ArrivalByTimeChart/DayTimeChart'
import AllLinesChart from './AllLineschart/AllLinesChart'
import WorstLinesChart from './WorstLinesChart/WorstLinesChart'
import OperatorSelector from 'src/pages/components/OperatorSelector'

// Services and libraries
import dayjs from 'src/dayjs'

// Declarations
const now = dayjs()

const DashboardPage = () => {
  const [startDate, setStartDate] = useDate(now.subtract(7, 'day'))
  const [endDate, setEndDate] = useDate(now.subtract(1, 'day'))
  const [operatorId, setOperatorId] = useState<number>()
  const { t } = useTranslation()

  const [AllChartsZeroLines, setAllChartsZeroLines] = useState(false)
  const [WorstLineZeroLines, setWorstLineZeroLines] = useState(false)
  const [AllDayTimeChartZeroLines, setAllDayTimeChartZeroLines] = useState(false)

  return (
    <PageContainer className="dashboard">
      <Typography className="page-title" variant="h4">
        {t('dashboard_page_title')}
        <InfoYoutubeModal
          label="Open video about this page"
          title={t('youtube_modal_info_title')}
          videoUrl="https://www.youtube.com/embed/bXg50_j_hTA?si=4rpSZwMRbMomE4g1"
        />
      </Typography>
      {AllChartsZeroLines && WorstLineZeroLines && AllDayTimeChartZeroLines ? (
        <Alert severity="warning" variant="outlined">
          {t('no_data_from_ETL')}
        </Alert>
      ) : null}
      <Alert severity="info" variant="outlined" icon={false}>
        {t('dashboard_page_description')}
      </Alert>
      {startDate > endDate ? (
        <Alert severity="error" variant="outlined">
          {t('bug_date_alert')}
        </Alert>
      ) : null}
      <Grid
        container
        spacing={2}
        alignItems="center"
        sx={{ marginTop: '0px' }}
        justifyContent="space-between">
        <Grid container size={{ xs: 12, lg: 6 }} spacing={2} alignItems="center">
          <Grid size={{ xs: 6 }}>
            <DateSelector
              time={startDate}
              onChange={(data) => setStartDate(data)}
              customLabel={t('start')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DateSelector
              time={endDate}
              onChange={(data) => setEndDate(data)}
              minDate={startDate}
              customLabel={t('end')}
            />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OperatorSelector operatorId={operatorId} setOperatorId={setOperatorId} />
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 6 }}>
          <AllLinesChart
            startDate={startDate}
            endDate={endDate}
            alertAllChartsZeroLinesHandling={setAllChartsZeroLines}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <WorstLinesChart
            startDate={startDate}
            endDate={endDate}
            operatorId={operatorId}
            alertWorstLineHandling={setWorstLineZeroLines}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DayTimeChart
            startDate={startDate}
            endDate={endDate}
            operatorId={operatorId}
            alertAllDayTimeChartHandling={setAllDayTimeChartZeroLines}
          />
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default DashboardPage

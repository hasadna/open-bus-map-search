import { Alert, Grid, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
// Services and libraries
import { parseIsraelDate, shiftIsraelDate, todayIsraelDate } from 'src/dayjs'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { DateSelector } from '../components/DateSelector'
import { PageContainer } from '../components/PageContainer'
// Components
import InfoYoutubeModal from '../components/YoutubeModal'
import AllLinesChart from './AllLineschart/AllLinesChart'
import DayTimeChart from './ArrivalByTimeChart/DayTimeChart'
import WorstLinesChart from './WorstLinesChart/WorstLinesChart'
// Styling
import './DashboardPage.scss'

const DashboardPage = () => {
  // `today` is read in component scope (per mount), not frozen at module load like the
  // old `const now`, so the default range can't go stale across midnight.
  const today = todayIsraelDate()
  const [startDate, setStartDate] = useState(parseIsraelDate(shiftIsraelDate(today, -7)))
  const [endDate, setEndDate] = useState(parseIsraelDate(shiftIsraelDate(today, -1)))
  const [operatorId, setOperatorId] = useState('')
  const { t } = useTranslation()

  const [AllChartsZeroLines, setAllChartsZeroLines] = useState(false)
  const [WorstLineZeroLines, setWorstLineZeroLines] = useState(false)
  const [AllDayTimeChartZeroLines, setAllDayTimeChartZeroLines] = useState(false)

  return (
    <PageContainer className="dashboard">
      <Typography className="page-title" variant="h4">
        {t('dashboard_page_title')}
        <InfoYoutubeModal
          label={t('open_video_about_this_page')}
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
        sx={{ marginTop: '0px', alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid container size={{ xs: 12, lg: 6 }} spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 6 }}>
            <DateSelector
              time={startDate}
              onChange={(data) => data && setStartDate(data)}
              customLabel={t('start')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DateSelector
              time={endDate}
              onChange={(data) => data && setEndDate(data)}
              minDate={startDate}
              customLabel={t('end')}
            />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OperatorSelector operatorId={operatorId} setOperatorId={setOperatorId} />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
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

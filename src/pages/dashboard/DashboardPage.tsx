import { Alert, Grid, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
// Services and libraries
import { useGroupBy } from 'src/api/groupByService'
import { useDate } from 'src/hooks/useDate'
import { addDays, todayCivilDate } from 'src/model/time/civilDate'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { CivilDateSelector } from '../components/CivilDateSelector'
import { PageContainer } from '../components/PageContainer'
// Components
import InfoYoutubeModal from '../components/YoutubeModal'
import AllLinesChart from './AllLineschart/AllLinesChart'
import DayTimeChart from './ArrivalByTimeChart/DayTimeChart'
import { ridesDataStatus, type RidesDataStatus } from './ridesDataStatus'
import WorstLinesChart from './WorstLinesChart/WorstLinesChart'
// Styling
import './DashboardPage.scss'

const RidesDataAlert = ({ status }: { status: RidesDataStatus }) => {
  const { t } = useTranslation()
  switch (status) {
    case 'error':
      return (
        <Alert severity="error" variant="outlined">
          {t('rides_data_fetch_failed')}
        </Alert>
      )
    case 'noData':
      return (
        <Alert severity="warning" variant="outlined">
          {t('rides_data_none_recorded')}
        </Alert>
      )
    case 'noActualRides':
      return (
        <Alert severity="warning" variant="outlined">
          {t('rides_data_none_executed')}
        </Alert>
      )
    default:
      return null
  }
}

const DashboardPage = () => {
  const [startDate, setStartDate] = useDate(addDays(todayCivilDate(), -7))
  const [endDate, setEndDate] = useDate(addDays(todayCivilDate(), -1))
  const [operatorId, setOperatorId] = useState('')
  const { t } = useTranslation()

  // Same query key AllLinesChart already caches, so this costs no extra request. Any
  // grouping of the range holds the same rides, so the coarsest one answers "was
  // anything executed?" for the whole page.
  const [rides, ridesLoading, ridesError] = useGroupBy({
    dateFrom: startDate,
    dateTo: endDate,
    groupBy: 'operator_ref',
  })

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
      <RidesDataAlert status={ridesDataStatus(rides, ridesLoading, ridesError)} />
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
            <CivilDateSelector value={startDate} onChange={setStartDate} customLabel={t('start')} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CivilDateSelector
              value={endDate}
              onChange={setEndDate}
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
          <AllLinesChart startDate={startDate} endDate={endDate} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <WorstLinesChart startDate={startDate} endDate={endDate} operatorId={operatorId} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DayTimeChart startDate={startDate} endDate={endDate} operatorId={operatorId} />
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default DashboardPage

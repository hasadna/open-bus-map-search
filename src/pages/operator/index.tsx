import { Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import moment from 'moment'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DateSelector } from '../components/DateSelector'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import WorstLinesChart from '../dashboard/WorstLinesChart/WorstLinesChart'
import { OperatorGaps } from './OperatorGaps'
import { OperatorInfo } from './OperatorInfo'
import { OperatorRoutes } from './OperatorRoutes'
import { SearchContext } from 'src/model/pageState'

const TIME_RANGES = ['day', 'week', 'month'] as const //  'year'

const OperatorPage = () => {
  const {
    search: { operatorId, timestamp },
    setSearch,
  } = useContext(SearchContext)
  const { t } = useTranslation()

  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGES)[number]>('day')
  useEffect(() => {
    setSearch(({ operatorId, timestamp }) => ({ operatorId, timestamp }))
  }, [])

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId }))
  }

  const handleTimestampChange = (time: moment.Moment | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? Date.now() }))
  }

  return (
    <PageContainer>
      <Typography variant="h4">{t('operator_title')}</Typography>
      <Grid container spacing={2}>
        <Grid size={{ sm: 4, xs: 12 }}>
          <OperatorSelector operatorId={operatorId} setOperatorId={handleOperatorChange} />
        </Grid>
        {operatorId && (
          <>
            <Grid size={{ sm: 4, xs: 12 }}>
              <DateSelector time={moment(timestamp)} onChange={handleTimestampChange} />
            </Grid>
            <Grid size={{ sm: 4, xs: 12 }}>
              <ToggleButtonGroup
                color="primary"
                value={timeRange}
                sx={{ height: 56 }}
                exclusive
                fullWidth
                onChange={(_, value: (typeof TIME_RANGES)[number]) =>
                  value ? setTimeRange(value) : undefined
                }>
                {TIME_RANGES.map((time) => (
                  <ToggleButton key={time} value={time}>
                    {t(`operator.time_range.${time}`)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </>
        )}
      </Grid>
      {operatorId && (
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ lg: 6, xs: 12 }}>
            <OperatorInfo operatorId={operatorId} />
            <div style={{ marginTop: '1rem' }} />
            <OperatorGaps operatorId={operatorId} timestamp={timestamp} timeRange={timeRange} />
          </Grid>
          <Grid size={{ lg: 6, xs: 12 }} sx={{ height: 443, display: 'grid' }}>
            <WorstLinesChart
              operatorId={operatorId}
              startDate={moment(timestamp).add(-1, timeRange)}
              endDate={moment(timestamp)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <OperatorRoutes operatorId={operatorId} timestamp={timestamp} />
          </Grid>
        </Grid>
      )}
    </PageContainer>
  )
}

export default OperatorPage

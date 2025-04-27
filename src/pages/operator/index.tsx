import { Grid, Typography } from '@mui/material'
import moment from 'moment'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DateSelector } from '../components/DateSelector'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import { OperatorInfo } from './OperatorInfo'
import { OperatorRoutes } from './OperatorRoutes'
import { OperatorGaps } from './OperatorGaps'
import { SearchContext } from 'src/model/pageState'

const OperatorPage = () => {
  const {
    search: { operatorId, timestamp },
    setSearch,
  } = useContext(SearchContext)
  const { t } = useTranslation()

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
          <Grid size={{ sm: 4, xs: 12 }}>
            <DateSelector time={moment(timestamp)} onChange={handleTimestampChange} />
          </Grid>
        )}
      </Grid>
      {operatorId && (
        <Grid container spacing={2}>
          <Grid size={{ lg: 6, xs: 12 }}>
            <OperatorInfo operatorId={operatorId} />
            <div style={{ marginTop: '1rem' }} />
            <OperatorGaps operatorId={operatorId} timestamp={timestamp} />
          </Grid>
          <Grid size={{ lg: 6, xs: 12 }}>
            <OperatorRoutes operatorId={operatorId} timestamp={timestamp} />
          </Grid>
        </Grid>
      )}
    </PageContainer>
  )
}

export default OperatorPage

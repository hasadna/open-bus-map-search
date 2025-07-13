import { Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { DateSelector } from '../components/DateSelector'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import WorstLinesChart from '../dashboard/WorstLinesChart/WorstLinesChart'
import { WarningContextProvider } from '../dashboard/context/WarningContextProvider'
import { OperatorGaps } from './OperatorGaps'
import { OperatorInfo } from './OperatorInfo'
import { OperatorRoutes } from './OperatorRoutes'
import { SearchContext } from 'src/model/pageState'
import dayjs from 'src/dayjs'

const TIME_RANGES = ['day', 'week', 'month'] as const //  'year'

const OperatorPage = () => {
  const {
    search: { operatorId, timestamp },
    setSearch,
  } = useContext(SearchContext)
  const { t, i18n } = useTranslation()

  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGES)[number]>('day')
  useEffect(() => {
    setSearch(({ operatorId, timestamp }) => ({ operatorId, timestamp }))
  }, [])

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId }))
  }

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? Date.now() }))
  }

  return (
    <PageContainer>
      <WarningContextProvider>
        <Typography variant="h4">{t('operator_title')}</Typography>
        <Grid container spacing={2}>
          <Grid size={{ sm: 4, xs: 12 }}>
            <OperatorSelector operatorId={operatorId} setOperatorId={handleOperatorChange} />
          </Grid>

          <Grid size={{ sm: 4, xs: 12 }}>
            <DateSelector
              time={dayjs(timestamp)}
              disabled={!operatorId}
              onChange={handleTimestampChange}
            />
          </Grid>

          <Grid size={{ sm: 4, xs: 12 }}>
            <ToggleButtonGroup
              color={!operatorId ? 'standard' : 'primary'}
              value={timeRange}
              disabled={!operatorId}
              sx={{ height: 56 }}
              exclusive
              fullWidth
              dir="rtl"
              onChange={(_, value: (typeof TIME_RANGES)[number]) =>
                value ? setTimeRange(value) : undefined
              }>
              {(i18n.dir() === 'rtl' ? TIME_RANGES : TIME_RANGES.toReversed()).map((time) => (
                <ToggleButton key={time} value={time}>
                  {t(`operator.time_range.${time}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        {operatorId && (
          <Grid container spacing={2}>
            <Grid size={{ lg: 6, xs: 12 }}>
              <OperatorInfo operatorId={operatorId} />
              <Spacing />
              <OperatorGaps operatorId={operatorId} timestamp={timestamp} timeRange={timeRange} />
            </Grid>
            <Grid size={{ lg: 6, xs: 12 }}>
              <ChartWrapper>
                <WorstLinesChart
                  operatorId={operatorId}
                  startDate={dayjs(timestamp).add(-1, timeRange)}
                  endDate={dayjs(timestamp)}
                />
              </ChartWrapper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <OperatorRoutes operatorId={operatorId} timestamp={timestamp} />
            </Grid>
          </Grid>
        )}
      </WarningContextProvider>
    </PageContainer>
  )
}

export default OperatorPage

const ChartWrapper = styled.div`
  height: 100%;
  > div {
    height: 100%;
  }
  .chart {
    height: 335.15px;
    overflow-y: scroll;
  }
`
const Spacing = styled.div`
  margin-top: 1rem;
`

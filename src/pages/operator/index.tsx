import { Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { shiftIsraelDate, todayIsraelDate } from 'src/dayjs'
import { GlobalSearchContext } from 'src/model/globalState'
import { DateSelector } from '../components/DateSelector'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import WorstLinesChart from '../dashboard/WorstLinesChart/WorstLinesChart'
import { OperatorGaps } from './OperatorGaps'
import { OperatorInfo } from './OperatorInfo'
import { OperatorRoutes } from './OperatorRoutes'

const TIME_RANGES = ['day', 'week', 'month'] as const //  'year'

const OperatorPage = () => {
  const {
    search: { operatorId, date },
    setSearch,
  } = useContext(GlobalSearchContext)
  const { t } = useTranslation()

  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGES)[number]>('day')

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId }))
  }

  const handleDateChange = (date: string | null) => {
    setSearch((current) => ({
      ...current,
      date: date ?? todayIsraelDate(),
    }))
  }

  return (
    <PageContainer>
      <Typography variant="h4">{t('operator_title')}</Typography>
      <Grid container spacing={2}>
        <Grid size={{ sm: 4, xs: 12 }}>
          <OperatorSelector
            operatorId={operatorId ?? undefined}
            setOperatorId={handleOperatorChange}
          />
        </Grid>

        <Grid size={{ sm: 4, xs: 12 }}>
          <DateSelector time={date} disabled={!operatorId} onChange={handleDateChange} />
        </Grid>

        <Grid size={{ sm: 4, xs: 12 }}>
          <ToggleButtonGroup
            color={!operatorId ? 'standard' : 'primary'}
            value={timeRange}
            disabled={!operatorId}
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
      </Grid>
      {operatorId && (
        <Grid container spacing={2}>
          <Grid size={{ lg: 6, xs: 12 }}>
            <OperatorInfo operatorId={operatorId} />
            <Spacing />
            <OperatorGaps operatorId={operatorId} date={date} timeRange={timeRange} />
          </Grid>
          <Grid size={{ lg: 6, xs: 12 }}>
            <ChartWrapper>
              <WorstLinesChart
                operatorId={operatorId}
                startDate={shiftIsraelDate(date, -1, timeRange)}
                endDate={date}
                alertWorstLineHandling={function (arg: boolean): void {
                  console.log('alertWorstLineHandling', arg)
                }}
              />
            </ChartWrapper>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <OperatorRoutes operatorId={operatorId} date={date} />
          </Grid>
        </Grid>
      )}
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

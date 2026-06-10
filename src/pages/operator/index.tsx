import { Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { usePageState } from 'src/hooks/usePageState'
import { GlobalSearchContext } from 'src/model/globalState'
import { DateSelector } from '../components/DateSelector'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import WorstLinesChart from '../dashboard/WorstLinesChart/WorstLinesChart'
import { OperatorGaps } from './OperatorGaps'
import { OperatorInfo } from './OperatorInfo'
import { OperatorRoutes } from './OperatorRoutes'

const TIME_RANGES = ['day', 'week', 'month'] as const

const OperatorPage = () => {
  const {
    search: { operatorId, date },
    setSearch,
  } = useContext(GlobalSearchContext)
  const { t } = useTranslation()

  // timeRange is shareable: a colleague receiving the link sees the same
  // aggregation window (day / week / month).
  const { params, setParams } = usePageState<
    { timeRange: 'day' | 'week' | 'month' },
    { scrollPosition: number }
  >(
    'operator',
    {
      params: { timeRange: 'day' },
      ui: { scrollPosition: 0 },
    },
    ['timeRange'],
  )

  const dateDayjs = dayjs.tz(date, ISRAEL_TIMEZONE)

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId }))
  }

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({
      ...current,
      date: toIsraelTimezone(time ?? dayjs()).format('YYYY-MM-DD'),
    }))
  }

  // OperatorGaps and OperatorRoutes still accept a numeric timestamp.
  const dateTimestamp = dayjs.tz(date, ISRAEL_TIMEZONE).valueOf()

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
          <DateSelector time={dateDayjs} disabled={!operatorId} onChange={handleDateChange} />
        </Grid>

        <Grid size={{ sm: 4, xs: 12 }}>
          <ToggleButtonGroup
            color={!operatorId ? 'standard' : 'primary'}
            value={params.timeRange}
            disabled={!operatorId}
            sx={{ height: 56 }}
            exclusive
            fullWidth
            onChange={(_, value: (typeof TIME_RANGES)[number]) =>
              value ? setParams((prev) => ({ ...prev, timeRange: value })) : undefined
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
            <OperatorGaps
              operatorId={operatorId}
              timestamp={dateTimestamp}
              timeRange={params.timeRange}
            />
          </Grid>
          <Grid size={{ lg: 6, xs: 12 }}>
            <ChartWrapper>
              <WorstLinesChart
                operatorId={operatorId}
                startDate={dayjs(dateTimestamp).add(-1, params.timeRange)}
                endDate={dayjs(dateTimestamp)}
                alertWorstLineHandling={function (arg: boolean): void {
                  console.log('alertWorstLineHandling', arg)
                }}
              />
            </ChartWrapper>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <OperatorRoutes operatorId={operatorId} timestamp={dateTimestamp} />
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

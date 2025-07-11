import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { Radio, RadioChangeEvent, Skeleton, Space } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { getRoutesAsync } from '../../api/gtfsService'
import { SearchContext } from '../../model/pageState'
import { DateSelector } from '../components/DateSelector'
import { useDate } from '../components/DateTimePicker'
import { Label } from '../components/Label'
import LineNumberSelector from '../components/LineSelector'
import { NotFound } from '../components/NotFound'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import RouteSelector from '../components/RouteSelector'
import { Row } from '../components/Row'
import { mapColorByExecution } from '../components/utils'
import InfoYoutubeModal from '../components/YoutubeModal'
import './GapsPatternsPage.scss'
import { useGapsList } from './useGapsList'
import { INPUT_SIZE } from 'src/resources/sizes'
import Widget from 'src/shared/Widget'
import dayjs from 'src/dayjs'

interface BusLineStatisticsProps {
  lineRef: number
  operatorRef: string
  fromDate: dayjs.Dayjs
  toDate: dayjs.Dayjs
}

const now = dayjs()

type CustomTooltipProps = TooltipProps<number, string> & {
  payload?: { name: string; value?: number }[]
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 1) {
    const actualRides = payload[0].value || 0
    const plannedRides = payload[1].value || 0
    const actualPercentage = ((actualRides / plannedRides) * 100).toFixed(0)
    return (
      <div className="custom-tooltip tooltip-style">
        {` בוצעו ${actualPercentage}% מהנסיעות (${actualRides}/${plannedRides})`}
      </div>
    )
  }
  return null
}

function GapsByHour({ lineRef, operatorRef, fromDate, toDate }: BusLineStatisticsProps) {
  const [sortingMode, setSortingMode] = useState<'hour' | 'severity'>('hour')
  const hourlyData = useGapsList(fromDate, toDate, operatorRef, lineRef, sortingMode)
  const isLoading = !hourlyData.length
  const { t } = useTranslation()
  const maxHourlyRides = Math.max(
    ...hourlyData.map((entry) => entry.planned_rides),
    ...hourlyData.map((entry) => entry.actual_rides),
  )

  return (
    lineRef > 0 && (
      <Widget marginBottom>
        {isLoading && lineRef ? (
          <Skeleton active />
        ) : (
          <>
            <Radio.Group
              style={{ marginBottom: '10px' }}
              onChange={(e: RadioChangeEvent) =>
                setSortingMode(e.target.value as 'hour' | 'severity')
              }
              value={sortingMode}>
              <Radio.Button value="hour">{t('order_by_hour')}</Radio.Button>
              <Radio.Button value="severity">{t('order_by_severity')} </Radio.Button>
            </Radio.Group>
            <ResponsiveContainer width="100%" height={hourlyData.length * 50}>
              <ComposedChart
                layout="vertical"
                width={500}
                height={hourlyData.length * 50}
                data={hourlyData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
                barGap={-20}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis
                  type="number"
                  xAxisId={0}
                  reversed={true}
                  orientation={'top'}
                  domain={[0, maxHourlyRides]}
                />
                <XAxis
                  type="number"
                  xAxisId={1}
                  reversed={true}
                  orientation={'top'}
                  domain={[0, maxHourlyRides]}
                  hide
                />
                <YAxis
                  dataKey="planned_hour"
                  type="category"
                  orientation={'right'}
                  style={{ direction: 'ltr', marginTop: '-10px' }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Bar dataKey="actual_rides" barSize={20} radius={9} xAxisId={1} opacity={30}>
                  {hourlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={mapColorByExecution(entry.planned_rides, entry.actual_rides)}
                    />
                  ))}
                </Bar>
                <Bar dataKey="planned_rides" barSize={20} fill="#413ea055" radius={9} xAxisId={0} />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </Widget>
    )
  )
}

const GapsPatternsPage = () => {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, routes, routeKey } = search
  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const { t } = useTranslation()

  const loadSearchData = async (signal: AbortSignal | undefined) => {
    setRoutesIsLoading(true)
    const routes = await getRoutesAsync(
      dayjs(startDate),
      dayjs(endDate),
      operatorId as string,
      lineNumber as string,
      signal,
    )
    setSearch((current) => (search.lineNumber === lineNumber ? { ...current, routes } : current))
    setRoutesIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    if (!operatorId || operatorId === '0' || !lineNumber) {
      setSearch((current) => ({ ...current, routeKey: undefined, routes: undefined }))
      return
    }
    loadSearchData(signal)
    return () => controller.abort()
  }, [operatorId, lineNumber, endDate, startDate, setSearch])

  return (
    <PageContainer>
      <Typography variant="h4">
        {t('gaps_patterns_page_title')}
        <InfoYoutubeModal
          label={t('open_video_about_this_page')}
          title={t('youtube_modal_info_title')}
          videoUrl="https://www.youtube-nocookie.com/embed?v=-C_rZlbHBmk&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=4"
        />
      </Typography>
      <Space direction="vertical" size="middle" style={{ marginBottom: '22px' }}>
        <Alert severity="info" variant="outlined" icon={false}>
          {t('gaps_patterns_page_description')}
        </Alert>
      </Space>
      {startDate > endDate ? (
        <Alert severity="error" variant="outlined">
          {t('bug_date_alert')}
        </Alert>
      ) : null}

      <Grid container spacing={2} alignItems="center" sx={{ maxWidth: INPUT_SIZE }}>
        <Grid size={{ xs: 12, sm: 4 }} className="hideOnMobile">
          <Label text={t('choose_dates')} />
        </Grid>
        <Grid
          container
          size={{ xs: 12, sm: 8 }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between">
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

        <Grid size={{ xs: 12, sm: 4 }} className="hideOnMobile">
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} className="hideOnMobile">
          <Label text={t('choose_line')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          {routesIsLoading && (
            <Row>
              <Label text={t('loading_routes')} />
              <CircularProgress />
            </Row>
          )}
          {!routesIsLoading &&
            routes &&
            (routes.length === 0 ? (
              <NotFound>{t('line_not_found')}</NotFound>
            ) : (
              <>
                <RouteSelector
                  routes={routes}
                  routeKey={routeKey}
                  setRouteKey={(key) => setSearch((current) => ({ ...current, routeKey: key }))}
                />
              </>
            ))}
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GapsByHour
          lineRef={routes?.find((route) => route.key === routeKey)?.lineRef || 0}
          operatorRef={operatorId || ''}
          fromDate={startDate}
          toDate={endDate}
        />
      </Grid>
    </PageContainer>
  )
}

export default GapsPatternsPage

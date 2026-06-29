import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { Radio, RadioChangeEvent, Space } from 'antd'
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
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'
import {
  formatIsraelDate,
  normalizeIsraelDate,
  parseIsraelDate,
  shiftIsraelDate,
  todayIsraelDate,
} from 'src/dayjs'
import { GlobalSearchContext } from 'src/model/globalState'
import { InitialUrlParamsContext, PageShareParamsContext } from 'src/model/routeContext'
import { INPUT_SIZE } from 'src/resources/sizes'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import Widget from 'src/shared/Widget'
import { getRoutesAsync } from '../../api/gtfsService'
import { BusRoute } from '../../model/busRoute'
import { DateSelector } from '../components/DateSelector'
import { Label } from '../components/Label'
import LineNumberSelector from '../components/LineSelector'
import { NotFound } from '../components/NotFound'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import RouteSelector from '../components/RouteSelector'
import { Row } from '../components/Row'
import { mapColorByExecution } from '../components/utils'
import InfoYoutubeModal from '../components/YoutubeModal'
import { useGapsList } from './useGapsList'
import './GapsPatternsPage.scss'

interface BusLineStatisticsProps {
  lineRef: number
  operatorRef: string
  fromDate: string
  toDate: string
}

const CustomTooltip = ({ active, payload }: TooltipContentProps) => {
  const { t } = useTranslation()
  if (active && payload && payload.length > 1) {
    const actualRides = Number(payload[0].value)
    const plannedRides = Number(payload[1].value)
    const actualPercentage =
      plannedRides > 0 ? ((actualRides / plannedRides) * 100).toFixed(0) : '0'

    return (
      <div className="custom-tooltip tooltip-style">
        {t('gaps_tooltip_rides_executed', {
          percentage: actualPercentage,
          actual: actualRides,
          planned: plannedRides,
        })}
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
          <SkeletonLoader active />
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
  const initialUrlParams = useContext(InitialUrlParamsContext)
  const today = todayIsraelDate()

  // The range bounds live as "YYYY-MM-DD" civil-day strings (URL, share params,
  // getRoutesAsync, GapsByHour) — same canonical form as the global search date. A Dayjs is
  // materialized inline only at the MUI pickers below.
  const [startDate, setStartDate] = useState<string>(
    () => normalizeIsraelDate(initialUrlParams.startDate) ?? shiftIsraelDate(today, -7),
  )
  const [endDate, setEndDate] = useState<string>(
    () => normalizeIsraelDate(initialUrlParams.endDate) ?? shiftIsraelDate(today, -1),
  )
  const { search, setSearch } = useContext(GlobalSearchContext)
  // LEGACY: manual share-param injection — replace with usePageState's per-page
  // persistent `params` when this page is migrated.
  const { setParams } = useContext(PageShareParamsContext)

  useEffect(() => {
    setParams({ startDate, endDate })
    return () => setParams({})
  }, [startDate, endDate, setParams])
  const { operatorId, lineNumber, routeKey } = search
  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const { t } = useTranslation()

  const loadSearchData = async (signal: AbortSignal | undefined) => {
    setRoutesIsLoading(true)
    const fetchedRoutes = await getRoutesAsync(
      startDate,
      endDate,
      operatorId ?? undefined,
      lineNumber ?? undefined,
      signal,
    )
    if (search.lineNumber === lineNumber) {
      setRoutes(fetchedRoutes)
    }
    setRoutesIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    if (!operatorId || operatorId === '0' || !lineNumber) {
      setSearch((current) => ({ ...current, routeKey: null }))
      setRoutes(undefined)
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

      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE, alignItems: 'center' }}>
        <Grid size={{ xs: 12, sm: 4 }} className="hideOnMobile">
          <Label text={t('choose_dates')} />
        </Grid>
        <Grid
          container
          size={{ xs: 12, sm: 8 }}
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid size={{ xs: 6 }}>
            <DateSelector
              time={parseIsraelDate(startDate)}
              onChange={(data) => data && setStartDate(formatIsraelDate(data))}
              customLabel={t('start')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DateSelector
              time={parseIsraelDate(endDate)}
              onChange={(data) => data && setEndDate(formatIsraelDate(data))}
              minDate={parseIsraelDate(startDate)}
              customLabel={t('end')}
            />
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }} className="hideOnMobile">
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <OperatorSelector
            operatorId={operatorId ?? undefined}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} className="hideOnMobile">
          <Label text={t('choose_line')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <LineNumberSelector
            lineNumber={lineNumber ?? undefined}
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
                  routeKey={routeKey ?? undefined}
                  setRouteKey={(key) =>
                    setSearch((current) => ({ ...current, routeKey: key ?? null }))
                  }
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

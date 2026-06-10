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
import dayjs from 'src/dayjs'
import { usePageState } from 'src/hooks/usePageState'
import { GlobalSearchContext } from 'src/model/globalState'
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
  fromDate: dayjs.Dayjs
  toDate: dayjs.Dayjs
}

const now = dayjs()
const DEFAULT_START = now.clone().subtract(7, 'days').toISOString()
const DEFAULT_END = now.clone().subtract(1, 'day').toISOString()

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

function GapsByHour({
  lineRef,
  operatorRef,
  fromDate,
  toDate,
  sortingMode,
  setSortingMode,
}: BusLineStatisticsProps & {
  sortingMode: 'hour' | 'severity'
  setSortingMode: (m: 'hour' | 'severity') => void
}) {
  const hourlyData = useGapsList(
    fromDate.valueOf(),
    toDate.valueOf(),
    operatorRef,
    lineRef,
    sortingMode,
  )
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
  const { search, setSearch } = useContext(GlobalSearchContext)
  const { operatorId, lineNumber, routeKey } = search
  const { t } = useTranslation()

  // Page params are shareable: a colleague receiving the link sees the same
  // date range and chart ordering. startDate/endDate are ISO strings.
  // sortingMode is persisted so the user's preferred view survives navigation.
  const { params, setParams } = usePageState<
    { startDate: string; endDate: string; sortingMode: 'hour' | 'severity' },
    { scrollPosition: number }
  >(
    'gaps-patterns',
    {
      params: {
        startDate: DEFAULT_START,
        endDate: DEFAULT_END,
        sortingMode: 'hour',
      },
      ui: { scrollPosition: 0 },
    },
    ['startDate', 'endDate', 'sortingMode'],
  )

  const startDate = dayjs(params.startDate)
  const endDate = dayjs(params.endDate)

  // Routes are page-local: used only to populate the RouteSelector.
  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [routesIsLoading, setRoutesIsLoading] = useState(false)

  const loadRoutes = async (signal: AbortSignal | undefined) => {
    setRoutesIsLoading(true)
    const fetched = await getRoutesAsync(
      startDate,
      endDate,
      operatorId ?? undefined,
      lineNumber ?? undefined,
      signal,
    )
    if (search.lineNumber === lineNumber) {
      setRoutes(fetched)
    }
    setRoutesIsLoading(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    if (!operatorId || operatorId === '0' || !lineNumber) {
      setSearch((current) => ({ ...current, routeKey: null }))
      setRoutes(undefined)
      return
    }
    loadRoutes(controller.signal)
    return () => controller.abort()
  }, [operatorId, lineNumber, params.endDate, params.startDate])

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
              time={startDate}
              onChange={(data) =>
                setParams((prev) => ({ ...prev, startDate: data?.toISOString() ?? prev.startDate }))
              }
              customLabel={t('start')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DateSelector
              time={endDate}
              onChange={(data) =>
                setParams((prev) => ({ ...prev, endDate: data?.toISOString() ?? prev.endDate }))
              }
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
              <RouteSelector
                routes={routes}
                routeKey={routeKey ?? undefined}
                setRouteKey={(key) =>
                  setSearch((current) => ({ ...current, routeKey: key ?? null }))
                }
              />
            ))}
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <GapsByHour
          lineRef={routes?.find((route) => route.key === routeKey)?.lineRef || 0}
          operatorRef={operatorId || ''}
          fromDate={startDate}
          toDate={endDate}
          sortingMode={params.sortingMode}
          setSortingMode={(m) => setParams((prev) => ({ ...prev, sortingMode: m }))}
        />
      </Grid>
    </PageContainer>
  )
}

export default GapsPatternsPage

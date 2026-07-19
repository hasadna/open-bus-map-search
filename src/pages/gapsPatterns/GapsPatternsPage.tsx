import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { Radio, RadioChangeEvent, Space } from 'antd'
import { useCallback, useContext, useEffect, useState } from 'react'
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
import dayjs, { toIsraelTimezone } from 'src/dayjs'
import { usePageState } from 'src/hooks/usePageState'
import { GlobalSearchContext } from 'src/model/globalState'
import { civilDate, civilDateToDayjs } from 'src/model/time/civilDate'
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

type SortingMode = 'hour' | 'severity'
type GapsParams = { startDate: string; endDate: string }
type GapsUi = { scrollPosition: number; sortingMode: SortingMode }

interface BusLineStatisticsProps {
  lineRef: number
  operatorRef: string
  fromDate: dayjs.Dayjs
  toDate: dayjs.Dayjs
  sortingMode: SortingMode
  setSortingMode: (mode: SortingMode) => void
}

const now = dayjs()
// Stored date-only (YYYY-MM-DD) so the calendar date never drifts across the UTC
// boundary on (de)serialization — getGapsAsync sends these as UTC `date` query params.
const DEFAULT_START_DATE = toIsraelTimezone(now).subtract(7, 'days').format('YYYY-MM-DD')
const DEFAULT_END_DATE = toIsraelTimezone(now).subtract(1, 'day').format('YYYY-MM-DD')
// Materialize a stored date-only string into a noon-UTC-anchored Dayjs (via the CivilDate
// representation), on demand at the few consumers that need one — the params stay plain strings.
const asDayjs = (dateStr: string) => civilDateToDayjs(civilDate(dateStr)!)

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
}: BusLineStatisticsProps) {
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
              onChange={(e: RadioChangeEvent) => setSortingMode(e.target.value as SortingMode)}
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
  // Page-local shareable params (namespaced `gaps-patterns.<key>` in the share URL):
  // just the date range. Dates stay YYYY-MM-DD strings, converted to a
  // noon-UTC-anchored Dayjs ad-hoc (asDayjs) only where a consumer needs one, so
  // the calendar date can't drift across the UTC boundary.
  // scrollPosition and the chart sort order are session-only ui — device/session
  // preferences, restored by usePageState but never put in the share URL.
  const { params, setParams, ui, setUi } = usePageState<GapsParams, GapsUi>('gaps-patterns', {
    params: { startDate: DEFAULT_START_DATE, endDate: DEFAULT_END_DATE },
    ui: { scrollPosition: 0, sortingMode: 'hour' },
  })
  const { startDate, endDate } = params
  const setStartDate = useCallback(
    (date: dayjs.Dayjs | null) => {
      if (!date) return
      setParams((prev) => ({ ...prev, startDate: toIsraelTimezone(date).format('YYYY-MM-DD') }))
    },
    [setParams],
  )
  const setEndDate = useCallback(
    (date: dayjs.Dayjs | null) => {
      if (!date) return
      setParams((prev) => ({ ...prev, endDate: toIsraelTimezone(date).format('YYYY-MM-DD') }))
    },
    [setParams],
  )
  const { search, setSearch } = useContext(GlobalSearchContext)
  const { operatorId, lineNumber, routeKey } = search
  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const { t } = useTranslation()

  const loadSearchData = async (signal: AbortSignal | undefined) => {
    setRoutesIsLoading(true)
    const fetchedRoutes = await getRoutesAsync(
      asDayjs(startDate),
      asDayjs(endDate),
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
              time={asDayjs(startDate)}
              onChange={(data) => setStartDate(data)}
              customLabel={t('start')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DateSelector
              time={asDayjs(endDate)}
              onChange={(data) => setEndDate(data)}
              minDate={asDayjs(startDate)}
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
          fromDate={asDayjs(startDate)}
          toDate={asDayjs(endDate)}
          sortingMode={ui.sortingMode}
          setSortingMode={(mode) => setUi((prev) => ({ ...prev, sortingMode: mode }))}
        />
      </Grid>
    </PageContainer>
  )
}

export default GapsPatternsPage

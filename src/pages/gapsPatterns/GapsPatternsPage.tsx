import { useContext, useEffect, useState } from 'react'
import './GapsPatternsPage.scss'
import { Moment } from 'moment'
import { Skeleton, Spin, Radio, Typography, RadioChangeEvent } from 'antd'
import moment from 'moment/moment'
import { useDate } from '../components/DateTimePicker'
import { PageContainer } from '../components/PageContainer'
import { Row } from '../components/Row'
import { Label } from '../components/Label'
import { useTranslation } from 'react-i18next'
import OperatorSelector from '../components/OperatorSelector'
import LineNumberSelector from '../components/LineSelector'
import { NotFound } from '../components/NotFound'
import RouteSelector from '../components/RouteSelector'
import { SearchContext } from '../../model/pageState'
import { getRoutesAsync } from '../../api/gtfsService'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2

import {
  Bar,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Cell,
  TooltipProps,
} from 'recharts'
import { mapColorByExecution } from '../components/utils'
import { useGapsList } from '../useGapsList'
import { DateSelector } from '../components/DateSelector'
import { INPUT_SIZE } from 'src/resources/sizes'
const { Title } = Typography
// Define prop types for the component
interface BusLineStatisticsProps {
  lineRef: number
  operatorRef: string
  fromDate: Moment
  toDate: Moment
}

const now = moment()

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
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
      <div className="widget">
        <Title level={3}>{t('dashboard_page_graph_title')}</Title>

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
              <Tooltip content={<CustomTooltip />} />
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
          </>
        )}
      </div>
    )
  )
}

const GapsPatternsPage = () => {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, routes, routeKey } = search
  const [routesIsLoading, setRoutesIsLoading] = useState(false)

  const loadSearchData = async () => {
    setRoutesIsLoading(true)
    const routes = await getRoutesAsync(
      moment(startDate),
      moment(endDate),
      operatorId as string,
      lineNumber as string,
    )
    setSearch((current) => (search.lineNumber === lineNumber ? { ...current, routes } : current))
    setRoutesIsLoading(false)
  }

  useEffect(() => {
    if (!operatorId || operatorId === '0' || !lineNumber) {
      setSearch((current) => ({ ...current, routeKey: undefined, routes: undefined }))
      return
    }
    loadSearchData()
  }, [operatorId, lineNumber, endDate, startDate, setSearch])

  const { t } = useTranslation()

  return (
    <PageContainer>
      <Grid container spacing={2} alignItems="center" sx={{ maxWidth: INPUT_SIZE }}>
        <Grid xs={4}>
          <Label text={t('choose_dates')} />
        </Grid>
        <Grid container spacing={2} xs={8} alignItems="center" justifyContent="space-between">
          <Grid xs={5.7}>
            <DateSelector
              time={startDate}
              onChange={(data) => setStartDate(data)}
              customLabel={t('start')}
            />
          </Grid>
          <Grid xs={0.1}>-</Grid>
          <Grid xs={5.7}>
            <DateSelector
              time={endDate}
              onChange={(data) => setEndDate(data)}
              customLabel={t('end')}
            />
          </Grid>
        </Grid>

        <Grid xs={4}>
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid xs={8}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        <Grid xs={4}>
          <Label text={t('choose_line')} />
        </Grid>
        <Grid xs={8}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>
        <Grid xs={12}>
          {routesIsLoading && (
            <Row>
              <Label text={t('loading_routes')} />
              <Spin />
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
      <Grid xs={12}>
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

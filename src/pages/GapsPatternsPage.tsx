import React, { useContext, useEffect, useState } from 'react'
import './GapsPatternsPage.scss'
import { getGapsAsync } from '../api/gapsService'
import { Moment } from 'moment'
import { DatePicker, Spin } from 'antd'
import moment from 'moment/moment'
import { useDate } from './components/DateTimePicker'
import { PageContainer } from './components/PageContainer'
import { Row } from './components/Row'
import { Label } from './components/Label'
import { TEXTS } from '../resources/texts'
import OperatorSelector from './components/OperatorSelector'
import LineNumberSelector from './components/LineSelector'
import { NotFound } from './components/NotFound'
import RouteSelector from './components/RouteSelector'
import { SearchContext } from '../model/pageState'
import { getRoutesAsync } from '../api/gtfsService'
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
import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { GetColorByExecution } from './components/utils/ColorBySeverity'
import { HourlyData, byHourHandler, bySeverityHandler } from './components/utils'

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
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gapsList = await getGapsAsync(fromDate, toDate, operatorRef, lineRef)

        // Convert gapsList data into hourly mapping as needed
        const hourlyMapping: Record<string, { planned_rides: number; actual_rides: number }> = {}

        for (const ride of gapsList) {
          if (ride.gtfsTime === null) {
            continue
          }
          const plannedHour = ride.gtfsTime.format('HH:mm')

          if (!hourlyMapping[plannedHour]) {
            hourlyMapping[plannedHour] = { planned_rides: 0, actual_rides: 0 }
          }

          hourlyMapping[plannedHour].planned_rides += 1
          if (ride.siriTime) {
            hourlyMapping[plannedHour].actual_rides += 1
          }
        }

        const result: HourlyData[] = Object.entries(hourlyMapping).map(([hour, data]) => ({
          planned_hour: hour,
          actual_rides: data.actual_rides,
          planned_rides: data.planned_rides,
        }))

        result.sort((a, b) => a.planned_hour.localeCompare(b.planned_hour))
        setHourlyData(result)
        sortData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [lineRef, operatorRef, fromDate, toDate])

  const maxHourlyRides = Math.max(
    ...hourlyData.map((entry) => entry.planned_rides),
    ...hourlyData.map((entry) => entry.actual_rides),
  )

  const [sortingMode, setSortingMode] = useState<'hour' | 'severity'>('hour')

  const sortData = (hourlyData: HourlyData[] = []) => {
    const orderedData = [...hourlyData]
    if (sortingMode === 'hour') {
      orderedData.sort(byHourHandler)
    } else if (sortingMode === 'severity') {
      orderedData.sort(bySeverityHandler)
    }
    setHourlyData(orderedData)
  }

  useEffect(() => {
    sortData(hourlyData)
  }, [sortingMode])

  return (
    <div>
      <div>
        <RadioGroup
          row
          aria-label="sorting-mode"
          name="sorting-mode"
          value={sortingMode}
          onChange={(e) => setSortingMode(e.target.value as 'hour' | 'severity')}>
          <FormControlLabel value="hour" control={<Radio />} label={TEXTS.order_by_hour} />
          <FormControlLabel value="severity" control={<Radio />} label={TEXTS.order_by_severity} />
        </RadioGroup>
      </div>
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
              fill={GetColorByExecution(entry.planned_rides, entry.actual_rides)}
            />
          ))}
        </Bar>
        <Bar dataKey="planned_rides" barSize={20} fill="#413ea055" radius={9} xAxisId={0} />
      </ComposedChart>
    </div>
  )
}

const GapsPatternsPage = () => {
  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, routes, routeKey } = search
  const [routesIsLoading, setRoutesIsLoading] = useState(false)

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      return
    }
    getRoutesAsync(moment(startDate), moment(endDate), operatorId, lineNumber)
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .finally(() => setRoutesIsLoading(false))
  }, [operatorId, lineNumber, endDate, startDate, setSearch])

  return (
    <PageContainer>
      <Row className="date-picker-container">
        <DatePicker
          defaultValue={startDate}
          onChange={(data) => setStartDate(data)}
          format="DD/MM/YYYY"
        />
        -
        <DatePicker
          defaultValue={endDate}
          onChange={(data) => setEndDate(data)}
          format="DD/MM/YYYY"
        />
      </Row>
      <Row>
        <Label text={TEXTS.choose_operator} />
        <OperatorSelector
          operatorId={operatorId}
          setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
        />
      </Row>
      <Row>
        <Label text={TEXTS.choose_line} />
        <LineNumberSelector
          lineNumber={lineNumber}
          setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
        />
      </Row>
      {routesIsLoading && (
        <Row>
          <Label text={TEXTS.loading_routes} />
          <Spin />
        </Row>
      )}
      {!routesIsLoading &&
        routes &&
        (routes.length === 0 ? (
          <NotFound>{TEXTS.line_not_found}</NotFound>
        ) : (
          <RouteSelector
            routes={routes}
            routeKey={routeKey}
            setRouteKey={(key) => setSearch((current) => ({ ...current, routeKey: key }))}
          />
        ))}
      <GapsByHour
        lineRef={routes?.find((route) => route.key === routeKey)?.lineRef || 0}
        operatorRef={operatorId || ''}
        fromDate={startDate}
        toDate={endDate}></GapsByHour>
    </PageContainer>
  )
}

export default GapsPatternsPage

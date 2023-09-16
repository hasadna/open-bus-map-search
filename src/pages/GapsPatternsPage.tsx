import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getGapsAsync } from '../api/gapsService'
import { Moment } from 'moment'
import { DatePicker, Spin } from 'antd'
import moment from 'moment/moment'
import { UseDate } from './components/DateTimePicker'
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
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Cell,
} from 'recharts'
import { FormControlLabel, Radio, RadioGroup, Switch } from '@mui/material'

// Define prop types for the component
interface BusLineStatisticsProps {
  lineRef: number
  operatorRef: string
  fromDate: Moment
  toDate: Moment
}

interface HourlyData {
  planned_hour: string
  actual_rides: number
  planned_rides: number
}

const now = moment()

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
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [lineRef, operatorRef, fromDate, toDate])

  const getColorForMisses = (planned: number, actual: number) => {
    const misses = planned - actual
    const percentageMisses = (misses / planned) * 100

    if (percentageMisses <= 5) {
      return 'green'
    } else if (percentageMisses <= 50) {
      return 'orange'
    } else {
      return 'red'
    }
  }

  const maxPlannedRides = Math.max(
    ...hourlyData.map((entry) => entry.planned_rides),
    ...hourlyData.map((entry) => entry.actual_rides),
  )

  const [sortingMode, setSortingMode] = useState<'hour' | 'severity'>('hour')

  // Function to sort the data array by hour
  const sortByHour = () => {
    hourlyData.sort((a, b) => a.planned_hour.localeCompare(b.planned_hour))
  }

  const sortBySeverity = () => {
    hourlyData.sort((a, b) => {
      const missesA = a.planned_rides - a.actual_rides
      const missesB = b.planned_rides - b.actual_rides
      const percentageMissesA = (missesA / a.planned_rides) * 100
      const percentageMissesB = (missesB / b.planned_rides) * 100

      // First, compare by percentage misses
      if (percentageMissesA !== percentageMissesB) {
        return percentageMissesB - percentageMissesA // Reverse order here
      }

      // If percentage misses are equal, compare by the amount of misses
      return missesB - missesA // Reverse order here
    })
  }

  // Sort the data based on the current sorting mode
  if (sortingMode === 'hour') {
    sortByHour()
  } else if (sortingMode === 'severity') {
    sortBySeverity()
  }

  return (
    <div>
      <div>
        <RadioGroup
          row
          aria-label="sorting-mode"
          name="sorting-mode"
          value={sortingMode}
          onChange={(e) => setSortingMode(e.target.value as 'hour' | 'severity')}>
          <FormControlLabel value="hour" control={<Radio />} label="Sort by Hour" />
          <FormControlLabel value="severity" control={<Radio />} label="Sort by Severity" />
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
          domain={[0, maxPlannedRides]}
        />
        <XAxis
          type="number"
          xAxisId={1}
          reversed={true}
          orientation={'top'}
          domain={[0, maxPlannedRides]}
          hide
        />
        <YAxis
          dataKey="planned_hour"
          type="category"
          orientation={'right'}
          style={{ direction: 'ltr', marginTop: '-10px' }}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="actual_rides" barSize={20} radius={9} xAxisId={1} opacity={30}>
          {hourlyData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColorForMisses(entry.planned_rides, entry.actual_rides)}
            />
          ))}
        </Bar>
        <Bar dataKey="planned_rides" barSize={20} fill="#413ea055" radius={9} xAxisId={0} />
      </ComposedChart>
    </div>
  )
}

const GapsPatternsPage = () => {
  const [startDate, setStartDate] = UseDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = UseDate(now.clone().subtract(1, 'day'))
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, routes, routeKey } = search
  const [routesIsLoading, setRoutesIsLoading] = useState(false)

  // useEffect(() => {
  //   if (operatorId && routes && routeKey && timestamp) {
  //     const selectedRoute = routes.find((route) => route.key === routeKey)
  //     if (!selectedRoute) {
  //       return
  //     }
  //     setGapsIsLoading(true)
  //     getGapsAsync(moment(timestamp), moment(timestamp), operatorId, selectedRoute.lineRef)
  //       .then(setGaps)
  //       .finally(() => setGapsIsLoading(false))
  //   }
  // }, [operatorId, routeKey, timestamp])

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

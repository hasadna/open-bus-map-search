import  moment from 'moment'
import { useContext, useEffect, useMemo, useState } from 'react'
import { getRoutesAsync, getStopsForRouteAsync } from 'src/api/gtfsService'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { Label } from 'src/pages/components/Label'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import RouteSelector from 'src/pages/components/RouteSelector'
import { INPUT_SIZE } from 'src/resources/sizes'
import { useTranslation } from 'react-i18next'
import { SearchContext } from '../../model/pageState'
import { NotFound } from '../components/NotFound'
import { Point } from '../realtimeMap'
import { BusStop } from 'src/model/busStop'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import '../Map.scss'
import { DateSelector } from '../components/DateSelector'
import { CircularProgress, Tooltip } from '@mui/material'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { PageContainer } from '../components/PageContainer'
import { MapWithLocationsAndPath, Path } from '../components/map-related/MapWithLocationsAndPath'
import Title from 'antd/es/typography/Title'

const SingleLineMapPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const { t } = useTranslation()

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    if (!operatorId || operatorId === '0' || !lineNumber) {
      setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
      return
    }
    getRoutesAsync(moment(timestamp), moment(timestamp), operatorId, lineNumber, signal).then(
      (routes) => {
        setSearch((current) =>
        search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        )
      }
    )
    return () => controller.abort()
  

  }, [operatorId, lineNumber, timestamp])

  

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )
  const selectedRouteIds = selectedRoute?.routeIds
  const { locations, isLoading: locationsIsLoading } = useVehicleLocations({
    from: selectedRouteIds ? +new Date(timestamp).setHours(0, 0, 0, 0) : 0,
    to: selectedRouteIds ? +new Date(timestamp).setHours(23, 59, 59, 999) : 0,
    lineRef: selectedRoute?.lineRef ?? 0,
    splitMinutes: 20,
  })

  const positions = useMemo(() => {
    const pos = locations.map<Point>((location) => ({
      loc: [location.lat, location.lon],
      color: location.velocity,
      operator: location.siri_route__operator_ref,
      bearing: location.bearing,
      recorded_at_time: new Date(location.recorded_at_time).getTime(),
      point: location,
    }))

    return pos
  }, [locations])

  const options = useMemo(() => {
    const options = positions
      .map((position) => position.point?.siri_ride__scheduled_start_time) // get all start times
      .filter((time, i, arr) => arr.indexOf(time) === i) // unique
      .map((time) => new Date(time ?? 0).toLocaleTimeString()) // convert to strings
      .map((time) => ({
        // convert to options
        value: time,
        label: time,
      }))
    return options
  }, [positions])

  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])
  const [startTime, setStartTime] = useState<string>('00:00:00')
  const [plannedRouteStops, setPlannedRouteStops] = useState<BusStop[]|undefined>([])

  useEffect(() => {
    setFilteredPositions(
      positions.filter(
        (position) =>
          new Date(position.point?.siri_ride__scheduled_start_time ?? 0).toLocaleTimeString() ===
          startTime,
      ),
    )
  }, [startTime])

  return (
    <PageContainer className="map-container">
      <Title className="page-title" level={3}>
        {t('single_line_map_title')}
      </Title>
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        {/* choose date*/}
        <Grid xs={4} className="hideOnMobile">
          <Label text={t('choose_date')} />
        </Grid>
        <Grid sm={5} xs={12}>
          <DateSelector
            time={moment(timestamp)}
            onChange={(ts) => setSearch((current) => ({ ...current, timestamp: ts.valueOf() }))}
          />
        </Grid>
        {/* choose operator */}
        <Grid xs={4} className="hideOnMobile">
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid sm={8} xs={12}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        {/* choose line number */}
        <Grid xs={4} className="hideOnMobile">
          <Label text={t('choose_line')} />
        </Grid>
        <Grid sm={8} xs={12}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>
        <Grid xs={12}>
          {routes &&
            (routes.length === 0 ? (
              <NotFound>{t('line_not_found')}</NotFound>
            ) : (
              <RouteSelector
                routes={routes}
                routeKey={routeKey}
                setRouteKey={(key) => setSearch((current) => ({ ...current, routeKey: key }))}
              />
            ))}
        </Grid>
        {/* choose route */}
        {positions &&     <>
      <Grid xs={3} className="hideOnMobile">
        <Label text={t('choose_start_time')} />
      </Grid>
      <Grid xs={1}>
        {locationsIsLoading && (
          <Tooltip title={t('loading_times_tooltip_content')}>
            <CircularProgress />
          </Tooltip>
        )}
      </Grid>
      {/* choose start time */}
      <Grid sm={5} xs={12}>
        <FilterPositionsByStartTimeSelector
          options={options}
          startTime={startTime}
          setStartTime={setStartTime}
        />
      </Grid>
    </>
      }
      </Grid>
      <MapWithLocationsAndPath positions={filteredPositions} />
    </PageContainer>
  )
}

export default SingleLineMapPage

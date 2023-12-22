import moment from 'moment'
import { useContext, useEffect, useMemo, useState } from 'react'
import { getRoutesAsync } from 'src/api/gtfsService'
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

import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import '../Map.scss'
import { DateSelector } from '../components/DateSelector'
import { CircularProgress, Tooltip } from '@mui/material'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { PageContainer } from '../components/PageContainer'
import { MapWithLocationsAndPath, Path } from '../components/map-related/MapWithLocationsAndPath'

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
      (routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
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

  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])

  const paths = useMemo(
    () =>
      filteredPositions.reduce((arr: Path[], loc) => {
        const line = arr.find((line) => line.vehicleRef === loc.point!.siri_ride__vehicle_ref)
        if (!line) {
          arr.push({
            locations: [loc.point!],
            lineRef: loc.point!.siri_route__line_ref,
            operator: loc.point!.siri_route__operator_ref,
            vehicleRef: loc.point!.siri_ride__vehicle_ref,
          })
        } else {
          line.locations.push(loc.point!)
        }
        return arr
      }, []),
    filteredPositions.flat(),
  )

  return (
    <PageContainer className="map-container">
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        {/* choose date*/}
        <Grid xs={4}>
          <Label text={t('choose_date')} />
        </Grid>
        <Grid xs={8}>
          <DateSelector
            time={moment(timestamp)}
            onChange={(ts) => setSearch((current) => ({ ...current, timestamp: ts.valueOf() }))}
          />
        </Grid>
        {/* choose operator */}
        <Grid xs={4}>
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid xs={8}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        {/* choose line number */}
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
        {positions && (
          <FilterPositionsByStartTime
            positions={positions}
            setFilteredPositions={setFilteredPositions}
            locationsIsLoading={locationsIsLoading}
          />
        )}
      </Grid>
      <MapWithLocationsAndPath positions={filteredPositions} paths={paths} />
    </PageContainer>
  )
}

function FilterPositionsByStartTime({
  positions,
  setFilteredPositions,
  locationsIsLoading,
}: {
  positions: Point[]
  setFilteredPositions: (positions: Point[]) => void
  locationsIsLoading: boolean
}) {
  const { t } = useTranslation()
  const [startTime, setStartTime] = useState<string>('00:00:00')
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
    <>
      <Grid xs={3}>
        <Label text={t('choose_start_time')} />
      </Grid>
      <Grid xs={1}>
        {locationsIsLoading && (
          <Tooltip title={t('loading_times_tooltip_content')}>
            <CircularProgress />
          </Tooltip>
        )}
      </Grid>
      <Grid xs={8}>
        <FilterPositionsByStartTimeSelector
          options={options}
          startTime={startTime}
          setStartTime={setStartTime}
        />
      </Grid>
    </>
  )
}

export default SingleLineMapPage

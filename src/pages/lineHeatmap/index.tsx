import type { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { Alert, Box, CircularProgress, Grid, Typography } from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer } from 'react-leaflet'
import { getRoutesAsync, getStopsForRouteAsync } from 'src/api/gtfsService'
import dayjs, { toIsraelTimezone } from 'src/dayjs'
import useVehicleLocations from 'src/hooks/useVehicleLocations'
import { BusStop } from 'src/model/busStop'
import { SearchContext } from 'src/model/pageState'
import { DateSelector } from 'src/pages/components/DateSelector'
import { Label } from 'src/pages/components/Label'
import LineNumberSelector from 'src/pages/components/LineSelector'
import { toPoint } from 'src/pages/components/map-related/map-types'
import { MapContent } from 'src/pages/components/map-related/MapContent'
import { NotFound } from 'src/pages/components/NotFound'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { PageContainer } from 'src/pages/components/PageContainer'
import RouteSelector from 'src/pages/components/RouteSelector'
import { Row } from 'src/pages/components/Row'
import { INPUT_SIZE } from 'src/resources/sizes'

const DEFAULT_MAP_CENTER: [number, number] = [32.3057988, 34.85478613]

function countRides(
  locations: SiriVehicleLocationWithRelatedPydanticModel[],
  serviceDayStart: dayjs.Dayjs,
  serviceDayEnd: dayjs.Dayjs,
): number {
  const rideKeys = new Set<string>()

  for (const location of locations) {
    const scheduledStart = location.siriRideScheduledStartTime
    const vehicleRef = location.siriRideVehicleRef
    if (!scheduledStart || !vehicleRef) continue

    const scheduledStartTime = toIsraelTimezone(scheduledStart)
    if (
      scheduledStartTime.isBefore(serviceDayStart) ||
      !scheduledStartTime.isBefore(serviceDayEnd)
    ) {
      continue
    }

    rideKeys.add(`${scheduledStartTime.toISOString()}-${vehicleRef}`)
  }

  return rideKeys.size
}

const LineHeatmapPage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [stops, setStops] = useState<BusStop[]>()
  const [routesAreLoading, setRoutesAreLoading] = useState(false)
  const [stopsAreLoading, setStopsAreLoading] = useState(false)

  const serviceDayStart = useMemo(() => toIsraelTimezone(timestamp).startOf('day'), [timestamp])
  const serviceDayEnd = useMemo(() => serviceDayStart.add(1, 'day'), [serviceDayStart])

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )

  const { locations, isLoading: locationsAreLoading } = useVehicleLocations({
    from: serviceDayStart.valueOf(),
    to: serviceDayEnd.valueOf(),
    operatorRef: operatorId ? Number(operatorId) : undefined,
    lineRef: selectedRoute?.lineRef,
    splitMinutes: 360,
    pause: !operatorId || !selectedRoute?.lineRef,
  })

  const positions = useMemo(() => locations.map(toPoint), [locations])
  const rideCount = useMemo(
    () => countRides(locations, serviceDayStart, serviceDayEnd),
    [locations, serviceDayEnd, serviceDayStart],
  )
  const isLoading = routesAreLoading || stopsAreLoading || locationsAreLoading

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
      setStops(undefined)
      return
    }

    const controller = new AbortController()
    setRoutesAreLoading(true)

    getRoutesAsync(dayjs(timestamp), dayjs(timestamp), operatorId, lineNumber, controller.signal)
      .then((fetchedRoutes) => {
        setSearch((current) =>
          current.lineNumber === lineNumber ? { ...current, routes: fetchedRoutes } : current,
        )
      })
      .catch((err) => {
        if (err?.cause?.name !== 'AbortError') {
          console.error('Failed to fetch routes:', err.message)
          setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
        }
      })
      .finally(() => setRoutesAreLoading(false))

    return () => controller.abort()
  }, [operatorId, lineNumber, timestamp, setSearch])

  useEffect(() => {
    if (!selectedRoute) {
      setStops(undefined)
      return
    }

    setStopsAreLoading(true)
    getStopsForRouteAsync(selectedRoute.routeIds, dayjs(timestamp))
      .then(setStops)
      .catch((err) => {
        console.error('Failed to fetch stops:', err.message)
        setStops(undefined)
      })
      .finally(() => setStopsAreLoading(false))
  }, [selectedRoute, timestamp])

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? Date.now() }))
  }

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId, routes: undefined, routeKey: undefined }))
  }

  const handleLineNumberChange = (lineNumber: string) => {
    setSearch((current) =>
      lineNumber === current.lineNumber
        ? { ...current }
        : { ...current, lineNumber, routes: undefined, routeKey: undefined },
    )
  }

  const handleRouteKeyChange = (routeKey?: string) => {
    setSearch((current) => ({ ...current, routeKey }))
  }

  return (
    <PageContainer className="map-container">
      <Typography className="page-title" variant="h4">
        {t('line_heatmap_page_title')}
      </Typography>
      <Alert severity="info" variant="outlined" icon={false}>
        {t('line_heatmap_page_description')}
      </Alert>
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE, mb: 1 }}>
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_date')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <DateSelector time={dayjs(timestamp)} onChange={handleTimestampChange} />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <OperatorSelector operatorId={operatorId} setOperatorId={handleOperatorChange} />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_line')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <LineNumberSelector lineNumber={lineNumber} setLineNumber={handleLineNumberChange} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          {routes?.length === 0 ? (
            <NotFound>{t('line_not_found')}</NotFound>
          ) : (
            <RouteSelector
              routes={routes || []}
              disabled={!routes}
              routeKey={routeKey}
              setRouteKey={handleRouteKeyChange}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12 }}>
          {isLoading && (
            <Row>
              <Label text={t('line_heatmap_loading_locations')} />
              <CircularProgress />
            </Row>
          )}
        </Grid>
      </Grid>

      {selectedRoute && !isLoading && (
        <>
          {positions.length > 0 && stops?.length ? (
            <>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Typography>
                  {t('line_heatmap_total_points', { count: positions.length })}
                </Typography>

                <Typography>{t('line_heatmap_total_rides', { count: rideCount })}</Typography>

                <Typography>{t('line_heatmap_total_stops', { count: stops.length })}</Typography>
              </Grid>
              <Box className="map-info" sx={{ minHeight: '65vh' }}>
                <MapContainer
                  center={DEFAULT_MAP_CENTER}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}>
                  <MapContent
                    positions={positions}
                    plannedRouteStops={stops}
                    heatmapMode
                    showNavigationButtons
                  />
                </MapContainer>
              </Box>
            </>
          ) : (
            <NotFound>{t('line_heatmap_no_data')}</NotFound>
          )}
        </>
      )}
    </PageContainer>
  )
}

export default LineHeatmapPage

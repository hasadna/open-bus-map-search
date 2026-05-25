import {
  CircularProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import { SearchContext } from 'src/model/globalState'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import RouteSelector from 'src/pages/components/RouteSelector'
import VehicleNumberSelector from 'src/pages/components/VehicleSelector'
import { DateSelector } from '../components/DateSelector'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import InfoYoutubeModal from '../components/YoutubeModal'

const SingleLineMapPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, vehicleNumber, date, routeKey: searchRouteKey, rideTime } = search
  const [type, setType] = useState<'routes' | 'vehicle'>(vehicleNumber ? 'vehicle' : 'routes')
  const { t } = useTranslation()

  const onRouteKeyChange = useCallback(
    (key: string | null) => setSearch((c) => ({ ...c, routeKey: key })),
    [setSearch],
  )
  const onRideTimeChange = useCallback(
    (time: string | null) => setSearch((c) => ({ ...c, rideTime: time })),
    [setSearch],
  )

  const {
    positions,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    routes,
    routeKey,
    setStartTime,
  } = useSingleLineData({
    operatorId: operatorId ?? undefined,
    lineNumber: lineNumber ?? undefined,
    vehicleNumber: vehicleNumber ?? undefined,
    date,
    routeKey: searchRouteKey,
    rideTime,
    onRouteKeyChange,
    onRideTimeChange,
  })

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({
      ...current,
      date: toIsraelTimezone(time ?? dayjs()).format('YYYY-MM-DD'),
      rideTime: null,
    }))
  }

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId, rideTime: null }))
  }

  const handleLineNumberChange = (lineNumber: string) => {
    setSearch((current) => ({ ...current, lineNumber, rideTime: null }))
  }

  const handleRouteKeyChange = (routeKey?: string) => {
    setSearch((current) => ({ ...current, routeKey: routeKey ?? null, rideTime: null }))
  }

  const handleVehicleNumberChange = (vehicleNumber?: number) => {
    setSearch((current) => ({ ...current, vehicleNumber: vehicleNumber ?? null, rideTime: null }))
  }

  const handleTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    value: 'routes' | 'vehicle' | null,
  ) => {
    if (!value) return
    setType(value)
    setSearch((current) =>
      value === 'routes'
        ? { ...current, vehicleNumber: null }
        : value === 'vehicle'
          ? { ...current, lineNumber: null, routeKey: null }
          : current,
    )
  }

  return (
    <PageContainer className="map-container">
      <Typography className="page-title" variant="h4">
        {t('singleline_map_page_title')}
        <InfoYoutubeModal
          label={t('open_video_about_this_page')}
          title={t('time_based_map_page_description')}
          videoUrl="https://www.youtube-nocookie.com/embed/bXg50_j_hTA?si=inyvqDylStvgNRA6&amp;start=93"
        />
      </Typography>
      <Grid container spacing={2}>
        <Grid container spacing={2} size={{ xs: 12 }}>
          {/* choose date*/}
          <Grid size={{ sm: 4, xs: 12 }}>
            <DateSelector time={dayjs.tz(date, ISRAEL_TIMEZONE)} onChange={handleDateChange} />
          </Grid>
          {/* choose operator */}
          <Grid size={{ sm: 4, xs: 12 }}>
            <OperatorSelector
              operatorId={operatorId ?? undefined}
              setOperatorId={handleOperatorChange}
              excludeIsraelRailways
            />
          </Grid>
          <Grid size={{ sm: 4, xs: 12 }}>
            {/* choose type */}
            <ToggleButtonGroup
              value={type}
              color="primary"
              dir="rtl"
              onChange={handleTypeChange}
              sx={{ height: 56 }}
              exclusive
              fullWidth>
              <ToggleButton value="routes">{t('singleline_map_page_route')}</ToggleButton>
              <ToggleButton value="vehicle">{t('singleline_map_page_vehicle_id')}</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        <Grid container spacing={2} size={12} alignContent={'center'}>
          {type === 'routes' ? (
            <>
              {/* choose line number */}
              <Grid size={{ sm: 4, xs: 12 }}>
                <LineNumberSelector
                  disabled={!operatorId}
                  lineNumber={lineNumber ?? undefined}
                  setLineNumber={handleLineNumberChange}
                />
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                {/* choose route */}
                {routes?.length === 0 ? (
                  <NotFound>{t('line_not_found')}</NotFound>
                ) : (
                  <RouteSelector
                    disabled={!routes}
                    routes={routes || []}
                    routeKey={routeKey}
                    setRouteKey={handleRouteKeyChange}
                  />
                )}
              </Grid>
            </>
          ) : (
            <>
              <Grid size={{ sm: 4, xs: 12 }}>
                {/* choose vehicle number */}
                <VehicleNumberSelector
                  disabled={!operatorId}
                  vehicleNumber={vehicleNumber ?? undefined}
                  setVehicleNumber={handleVehicleNumberChange}
                />
              </Grid>
            </>
          )}
          {positions && (
            <>
              {/* choose start time */}
              <Grid
                size={{ sm: type === 'routes' ? 4 : 8, xs: 12 }}
                container
                alignItems="center"
                display="flex"
                gap={2}
                flexWrap="nowrap"
                justifyContent="space-between">
                <FilterPositionsByStartTimeSelector
                  options={options}
                  disabled={!routeKey && !vehicleNumber}
                  startTime={startTime}
                  setStartTime={setStartTime}
                />
                {locationsAreLoading && (
                  <Tooltip title={t('loading_times_tooltip_content')}>
                    <CircularProgress />
                  </Tooltip>
                )}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
      <MapWithLocationsAndPath
        positions={positions}
        plannedRouteStops={plannedRouteStops}
        showNavigationButtons
      />
    </PageContainer>
  )
}

export default SingleLineMapPage

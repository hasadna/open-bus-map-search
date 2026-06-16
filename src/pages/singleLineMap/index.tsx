import { CircularProgress, Grid, Link as MuiLink, Tooltip, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import { GlobalSearchContext } from 'src/model/globalState'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import RouteSelector from 'src/pages/components/RouteSelector'
import { vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'
import { DateSelector } from '../components/DateSelector'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import InfoYoutubeModal from '../components/YoutubeModal'

const SingleLineMapPage = () => {
  const { search, setSearch } = useContext(GlobalSearchContext)
  const { operatorId, lineNumber, date, routeKey: searchRouteKey, rideTime } = search
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
    positionGroups,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    routes,
    routeKey,
    selectedVehicleRefs,
    error,
    setStartTime,
  } = useSingleLineData({
    operatorId: operatorId ?? undefined,
    lineNumber: lineNumber ?? undefined,
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
          {/* choose line number */}
          <Grid size={{ sm: 4, xs: 12 }}>
            <LineNumberSelector
              disabled={!operatorId}
              lineNumber={lineNumber ?? undefined}
              setLineNumber={handleLineNumberChange}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} size={12} sx={{ alignContent: 'center' }}>
          <Grid size={{ sm: 4, xs: 12 }}>
            {/* choose route */}
            {error ? (
              <NotFound>{error}</NotFound>
            ) : routes?.length === 0 ? (
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
          {/* choose start time */}
          <Grid
            size={{ sm: 8, xs: 12 }}
            container
            sx={{
              alignItems: 'center',
              display: 'flex',
              gap: 2,
              flexWrap: 'nowrap',
              justifyContent: 'space-between',
            }}>
            <FilterPositionsByStartTimeSelector
              options={options}
              disabled={!routeKey}
              startTime={startTime}
              setStartTime={setStartTime}
            />
            {locationsAreLoading && (
              <Tooltip title={t('loading_times_tooltip_content')}>
                <CircularProgress />
              </Tooltip>
            )}
          </Grid>
        </Grid>
        {/* vehicle(s) of the shown ride — link to the vehicle page */}
        {selectedVehicleRefs.length > 0 && (
          <Grid size={12}>
            <Typography variant="body2">
              {t('singleline_map_page_vehicle_id')}:{' '}
              {selectedVehicleRefs.map((ref, idx) => (
                <span key={ref}>
                  {idx > 0 && ', '}
                  {/* reloadDocument: the vehicle page seeds its number from the URL
                      captured at page load (InitialUrlParamsContext), so this link
                      must be a full navigation, not an in-app SPA transition. */}
                  <MuiLink
                    component={Link}
                    to={`/vehicle?vehicleNumber=${ref}`}
                    reloadDocument
                    underline="hover">
                    {vehicleIDFormat(ref)}
                  </MuiLink>
                </span>
              ))}
            </Typography>
          </Grid>
        )}
      </Grid>
      <MapWithLocationsAndPath
        positionGroups={positionGroups}
        plannedRouteStops={plannedRouteStops}
        showNavigationButtons
      />
    </PageContainer>
  )
}

export default SingleLineMapPage

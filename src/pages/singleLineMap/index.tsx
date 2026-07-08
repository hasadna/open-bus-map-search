import SearchIcon from '@mui/icons-material/Search'
import { Alert, CircularProgress, Grid, Link as MuiLink, Tooltip, Typography } from '@mui/material'
import { useCallback, useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import { GlobalSearchContext } from 'src/model/globalState'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import RouteSelector from 'src/pages/components/RouteSelector'
import { DateSelector } from '../components/DateSelector'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import type { FocusTarget } from '../components/map-related/map-types'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import InfoYoutubeModal from '../components/YoutubeModal'
import { GpsCoverageStrip } from './GpsCoverageStrip'

// TEMP (issue #1674): the vehicle-number search moved from this page to /vehicle.
// This notice redirects users still looking for it here. Remove once it has run its course.
const VEHICLE_NOTICE_DISMISS_KEY = 'vehicleSearchMovedNoticeDismissed'

const SingleLineMapPage = () => {
  const { search, setSearch } = useContext(GlobalSearchContext)
  const { operatorId, lineNumber, date, routeKey: searchRouteKey, rideTime } = search
  const { t } = useTranslation()

  const [vehicleNoticeDismissed, setVehicleNoticeDismissed] = useState(
    () => localStorage.getItem(VEHICLE_NOTICE_DISMISS_KEY) === '1',
  )
  const dismissVehicleNotice = useCallback(() => {
    localStorage.setItem(VEHICLE_NOTICE_DISMISS_KEY, '1')
    setVehicleNoticeDismissed(true)
  }, [])

  const onRouteKeyChange = useCallback(
    (key: string | null) => setSearch((c) => ({ ...c, routeKey: key })),
    [setSearch],
  )
  const onRideTimeChange = useCallback(
    (time: string | null) => setSearch((c) => ({ ...c, rideTime: time })),
    [setSearch],
  )

  // Lets the coverage strip (rendered below the map) fly the map to a ping. The seq
  // counter makes repeated clicks on the same ping re-trigger the fly-to.
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null)
  const focusSeq = useRef(0)
  const focusPing = useCallback((loc: [number, number]) => {
    focusSeq.current += 1
    setFocusTarget({ loc, seq: focusSeq.current })
  }, [])

  const {
    positionGroups,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    routes,
    routeKey,
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
      {!vehicleNoticeDismissed && (
        <Alert
          severity="info"
          variant="outlined"
          icon={<SearchIcon />}
          onClose={dismissVehicleNotice}
          sx={{
            mb: 2,
            alignItems: 'center',
            borderWidth: 2,
            fontSize: '0.95rem',
            fontWeight: 700,
          }}>
          {/* Each half is inline-block so the sentence breaks cleanly between them on
              narrow screens instead of wrapping mid-phrase. */}
          <span style={{ display: 'inline-block' }}>{t('singleline_vehicle_search_moved')}</span>{' '}
          <span style={{ display: 'inline-block' }}>
            {t('singleline_vehicle_search_moved_action')}{' '}
            <MuiLink component={Link} to="/vehicle" underline="hover">
              {t('singleline_vehicle_search_moved_link')}
            </MuiLink>
          </span>
        </Alert>
      )}
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
      </Grid>
      <MapWithLocationsAndPath
        positionGroups={positionGroups}
        plannedRouteStops={plannedRouteStops}
        showNavigationButtons
        focusTarget={focusTarget}
      />
      <GpsCoverageStrip positionGroups={positionGroups} onFocusPing={focusPing} />
    </PageContainer>
  )
}

export default SingleLineMapPage

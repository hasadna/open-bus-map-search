import { CircularProgress, Grid, Tooltip } from '@mui/material'
import { useCallback, useContext, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
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
import {
  PageHeader,
  PageHeaderSubtitle,
  PageHeaderTitle,
  PageHeaderVideoTrigger,
} from '../components/pageHeader'
import { GpsCoverageStrip } from './GpsCoverageStrip'

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
      <PageHeader>
        <PageHeaderTitle>{t('singleline_map_page_title')}</PageHeaderTitle>
        <PageHeaderSubtitle>
          {t('singleline_map_page_description')}{' '}
          <Trans
            i18nKey="page_header_video_guide_inline"
            components={{
              video: (
                <PageHeaderVideoTrigger
                  title={t('youtube_modal_info_title')}
                  videoUrl="https://www.youtube-nocookie.com/embed/bXg50_j_hTA?si=inyvqDylStvgNRA6&start=93">
                  {null}
                </PageHeaderVideoTrigger>
              ),
            }}
          />
        </PageHeaderSubtitle>
      </PageHeader>
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

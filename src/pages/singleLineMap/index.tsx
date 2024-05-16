import moment from 'moment'
import { useContext, useEffect, useMemo } from 'react'
import { getRoutesAsync } from 'src/api/gtfsService'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import RouteSelector from 'src/pages/components/RouteSelector'
import { INPUT_SIZE } from 'src/resources/sizes'
import { useTranslation } from 'react-i18next'
import { SearchContext } from '../../model/pageState'
import { NotFound } from '../components/NotFound'
import Grid from '@mui/material/Unstable_Grid2'
import '../Map.scss'
import { DateSelector } from '../components/DateSelector'
import { CircularProgress, Tooltip } from '@mui/material'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { PageContainer } from '../components/PageContainer'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import Typography from '@mui/material/Typography';
import InfoYoutubeModal from '../components/YoutubeModal'
import { useSingleLineData } from 'src/hooks/useSingleLineData'

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

    getRoutesAsync(moment(timestamp), moment(timestamp), operatorId, lineNumber, signal)
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .catch((err) => {
        console.error(err)
        setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
        controller.abort()
      })
    return () => controller.abort()
  }, [operatorId, lineNumber, timestamp])

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )
  const selectedRouteIds = selectedRoute?.routeIds

  const {
    positions,
    filteredPositions,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    setStartTime,
  } = useSingleLineData(selectedRoute?.lineRef, selectedRouteIds)

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
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        <Grid container spacing={2} xs={12}>
          {/* choose date*/}
          <Grid sm={4} xs={12}>
            <DateSelector
              time={moment(timestamp)}
              onChange={(ts) => setSearch((current) => ({ ...current, timestamp: ts.valueOf() }))}
            />
          </Grid>
          {/* choose operator */}
          <Grid sm={4} xs={12}>
            <OperatorSelector
              operatorId={operatorId}
              setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
            />
          </Grid>
          {/* choose line number */}
          <Grid sm={4} xs={12}>
            <LineNumberSelector
              lineNumber={lineNumber}
              setLineNumber={(number) =>
                setSearch((current) => ({ ...current, lineNumber: number }))
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} xs={12} alignContent={'center'}>
          <Grid sm={6} xs={12}>
            {/* choose route */}
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
          {positions && (
            <>
              <Grid sm={2} xs={12}>
                {locationsAreLoading && (
                  <Tooltip title={t('loading_times_tooltip_content')}>
                    <CircularProgress />
                  </Tooltip>
                )}
              </Grid>
              {/* choose start time */}
              <Grid sm={4} xs={12}>
                <FilterPositionsByStartTimeSelector
                  options={options}
                  startTime={startTime}
                  setStartTime={setStartTime}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
      <MapWithLocationsAndPath
        positions={filteredPositions}
        plannedRouteStops={plannedRouteStops}
      />
    </PageContainer>
  )
}

export default SingleLineMapPage

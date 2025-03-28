import moment from 'moment'
import { useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Grid from '@mui/material/Unstable_Grid2'
import { CircularProgress, Tooltip } from '@mui/material'
import Typography from '@mui/material/Typography'
import { SearchContext } from '../../model/pageState'
import { NotFound } from '../components/NotFound'
import '../Map.scss'
import { DateSelector } from '../components/DateSelector'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { PageContainer } from '../components/PageContainer'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import InfoYoutubeModal from '../components/YoutubeModal'
import { INPUT_SIZE } from 'src/resources/sizes'
import RouteSelector from 'src/pages/components/RouteSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import LineNumberSelector from 'src/pages/components/LineSelector'
import { getRoutesAsync } from 'src/api/gtfsService'
import { useSingleLineData } from 'src/hooks/useSingleLineData'

const SingleLineMapPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const { t } = useTranslation()

  useEffect(() => {
    if (!operatorId || operatorId === '0' || !lineNumber) {
      setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
      setStartTime(undefined)
      return
    }

    const controller = new AbortController()
    const time = moment(timestamp)

    getRoutesAsync(time, time, operatorId, lineNumber, controller.signal)
      .then((routes) => {
        setSearch((current) => ({
          ...current,
          routes,
          routeKey:
            // if is same line it keep route key
            current.lineNumber === lineNumber && current.operatorId === operatorId
              ? current.routeKey
              : undefined,
        }))
      })
      .catch((err) => {
        console.error(err)
        setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
      })

    return () => controller.abort()
  }, [operatorId, lineNumber, timestamp])

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )

  const {
    positions,
    filteredPositions,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    setStartTime,
  } = useSingleLineData(selectedRoute?.lineRef, selectedRoute?.routeIds)

  const handleTimestampChange = (time: moment.Moment | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? Date.now() }))
  }

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId }))
  }

  const handleLineNumberChange = (lineNumber: string) => {
    setSearch((current) => ({ ...current, lineNumber }))
  }

  const handleRouteKeyChange = (routeKey?: string) => {
    setSearch((current) => ({ ...current, routeKey }))
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
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        <Grid container spacing={2} xs={12}>
          {/* choose date*/}
          <Grid sm={4} xs={12}>
            <DateSelector time={moment(timestamp)} onChange={handleTimestampChange} />
          </Grid>
          {/* choose operator */}
          <Grid sm={4} xs={12}>
            <OperatorSelector operatorId={operatorId} setOperatorId={handleOperatorChange} />
          </Grid>
          {/* choose line number */}
          <Grid sm={4} xs={12}>
            <LineNumberSelector lineNumber={lineNumber} setLineNumber={handleLineNumberChange} />
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
                  setRouteKey={handleRouteKeyChange}
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
        showNavigationButtons
      />
    </PageContainer>
  )
}

export default SingleLineMapPage

import { CircularProgress, Grid, Tooltip, Typography } from '@mui/material'
import { useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SearchContext } from '../../model/pageState'
import { DateSelector } from '../components/DateSelector'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import InfoYoutubeModal from '../components/YoutubeModal'
import { getRoutesAsync } from 'src/api/gtfsService'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import RouteSelector from 'src/pages/components/RouteSelector'
import { INPUT_SIZE } from 'src/resources/sizes'
import dayjs from 'src/dayjs'
import '../Map.scss'

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
    const time = dayjs(timestamp)

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
        if (err?.cause?.name !== 'AbortError') {
          setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
        }
      })

    return () => controller.abort()
  }, [operatorId, lineNumber, timestamp])

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )

  const { positions, locationsAreLoading, options, plannedRouteStops, startTime, setStartTime } =
    useSingleLineData(selectedRoute?.lineRef, selectedRoute?.routeIds)

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
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
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }} className="display-sticky">
        <Grid container spacing={2} size={{ xs: 12 }}>
          {/* choose date*/}
          <Grid size={{ sm: 4, xs: 12 }}>
            <DateSelector time={dayjs(timestamp)} onChange={handleTimestampChange} />
          </Grid>
          {/* choose operator */}
          <Grid size={{ sm: 4, xs: 12 }}>
            <OperatorSelector operatorId={operatorId} setOperatorId={handleOperatorChange} />
          </Grid>
          {/* choose line number */}
          <Grid size={{ sm: 4, xs: 12 }}>
            <LineNumberSelector lineNumber={lineNumber} setLineNumber={handleLineNumberChange} />
          </Grid>
        </Grid>
        <Grid container spacing={2} size={{ xs: 12 }} alignContent={'center'}>
          <Grid size={{ sm: 6, xs: 12 }}>
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
              <Grid size={{ sm: 2, xs: 12 }}>
                {locationsAreLoading && (
                  <Tooltip title={t('loading_times_tooltip_content')}>
                    <CircularProgress />
                  </Tooltip>
                )}
              </Grid>
              {/* choose start time */}
              <Grid size={{ sm: 4, xs: 12 }}>
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
        positions={positions}
        plannedRouteStops={plannedRouteStops}
        showNavigationButtons
      />
    </PageContainer>
  )
}

export default SingleLineMapPage

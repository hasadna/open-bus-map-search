import { Grid, CircularProgress } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import { useContext, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { Tooltip } from 'antd'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import LineProfileHeader from './LineProfileHeader'
import { LineProfileDetails } from './LineProfileDetails'
import { Route } from './Route.interface'
import Widget from 'src/shared/Widget'
import { SearchContext, TimelinePageState } from 'src/model/pageState'
import { getRoutesAsync } from 'src/api/gtfsService'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import './LineProfile.scss'
import StopSelector from 'src/pages/components/StopSelector'
import { BusRoute } from 'src/model/busRoute'

const LineProfileWrapper = () => (
  <PageContainer className="line-data-container">
    <LineProfile />
  </PageContainer>
)

const LineProfile = () => {
  const { t } = useTranslation()
  const route = useLoaderData<Route & { message?: string }>()
  const [{ stopKey }, setState] = useState<TimelinePageState>({})
  const [routes, setRoutes] = useState<BusRoute[]>()
  const { setSearch } = useContext(SearchContext)

  const selectedRoute = useMemo(
    () => routes?.find((r) => r.routeIds[0] === route.id),
    [routes, route],
  )

  useEffect(() => {
    if (!route.id) {
      return
    }
    const time = moment(route.date)
    getRoutesAsync(time, time, route.operator_ref.toString(), route.route_short_name).then(
      (routes) => {
        setSearch(() => ({
          timestamp: time.valueOf(),
          operatorId: route.operator_ref.toString(),
          lineNumber: route.route_short_name,
          routes,
          routeKey: route.route_long_name,
        }))
        setRoutes(routes)
        setState({})
      },
    )
  }, [route.id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const {
    filteredPositions,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    setStartTime,
  } = useSingleLineData(
    selectedRoute?.lineRef,
    selectedRoute?.routeIds,
    selectedRoute?.date.getTime(),
  )

  if (route.message)
    return (
      <NotFound>
        <Widget>
          <h1>{t('lineProfile.notFound')}</h1>
          <pre>{route.message}</pre>
        </Widget>
      </NotFound>
    )

  return (
    <div className="container">
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 4 }} className="inputs">
          <StopSelector
            stops={plannedRouteStops || []}
            stopKey={stopKey}
            setStopKey={(key) =>
              setState((current) => {
                const stop = plannedRouteStops?.find((stop) => stop.key === key)
                return { ...current, stopKey: key, stopName: stop?.name }
              })
            }
          />
          <div className="startTime">
            {locationsAreLoading && (
              <Tooltip title={t('loading_times_tooltip_content')}>
                <CircularProgress />
              </Tooltip>
            )}
            <FilterPositionsByStartTimeSelector
              options={options}
              startTime={startTime}
              setStartTime={setStartTime}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Widget>
            <LineProfileHeader {...route} />
            <LineProfileDetails {...route} />
          </Widget>
        </Grid>
      </Grid>
      <MapWithLocationsAndPath
        positions={filteredPositions}
        plannedRouteStops={plannedRouteStops}
        showNavigationButtons
      />
    </div>
  )
}

export default LineProfileWrapper

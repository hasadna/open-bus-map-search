import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router-dom'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { Tooltip } from 'antd'
import CircularProgress from '@mui/material/CircularProgress'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { DateSelector } from '../components/DateSelector'
import RouteSelector from '../components/RouteSelector'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import LineProfileHeader from './LineProfileHeader'
import { LineProfileDetails } from './LineProfileDetails'
import { Route } from './Route.interface'
import Widget from 'src/shared/Widget'
import { SearchContext, TimelinePageState } from 'src/model/pageState'
import { getStopsForRouteAsync } from 'src/api/gtfsService'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import './LineProfile.scss'
import StopSelector from 'src/pages/components/StopSelector'

const LineProfileWrapper = () => (
  <PageContainer className="line-data-container">
    <LineProfile />
  </PageContainer>
)

const LineProfile = () => {
  const { t } = useTranslation()
  const route = useLoaderData() as Route & { message?: string }
  const [state, setState] = useState<TimelinePageState>({})
  const { stopKey, stops } = state
  const { search, setSearch } = useContext(SearchContext)
  const { timestamp, routes, routeKey } = search
  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )

  const selectedRouteIds = selectedRoute?.routeIds
  const clearStops = useCallback(() => {
    setState((current) => ({
      ...current,
      stops: undefined,
      stopName: undefined,
      stopKey: undefined,
      gtfsHitTimes: undefined,
      siriHitTimes: undefined,
    }))
  }, [setState])

  useEffect(() => {
    clearStops()
    if (!routeKey || !selectedRouteIds) {
      return
    }
    getStopsForRouteAsync(selectedRouteIds, moment(timestamp)).then((stops) =>
      setState((current) => ({ ...current, stops: stops })),
    )
  }, [route, routeKey, clearStops])

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
  } = useSingleLineData(route.line_ref, [route.id])

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
          <DateSelector
            time={moment(timestamp)}
            onChange={(ts) =>
              setSearch((current) => ({ ...current, timestamp: ts?.valueOf() ?? Date.now() }))
            }
          />
          <RouteSelector
            routes={routes ?? []}
            routeKey={routeKey}
            setRouteKey={(key) => setSearch((current) => ({ ...current, routeKey: key }))}
          />
          {stops && (
            <StopSelector
              stops={stops}
              stopKey={stopKey}
              setStopKey={(key) =>
                setState((current) => {
                  const stop = current.stops?.find((stop) => stop.key === key)
                  return { ...current, stopKey: key, stopName: stop?.name }
                })
              }
            />
          )}
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
      />
    </div>
  )
}

export default LineProfileWrapper

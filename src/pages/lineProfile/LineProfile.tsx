import Grid from '@mui/material/Unstable_Grid2'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { Spin, Tooltip } from 'antd'
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
import { SearchContext } from 'src/model/pageState'
import { getRoutesAsync } from 'src/api/gtfsService'
import { BusRoute } from 'src/model/busRoute'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import './LineProfile.scss'

const LineProfileWrapper = () => (
  <PageContainer className="line-data-container">
    <LineProfile />
  </PageContainer>
)

const LineProfile = () => {
  const { t } = useTranslation()
  const {
    search: { timestamp },
    setSearch,
  } = useContext(SearchContext)
  const route = useLoaderData() as Route & { message?: string }
  const [availableRoutes, setAvailableRoutes] = useState<BusRoute[] | null>(null)
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    getRoutesAsync(
      moment(timestamp),
      moment(timestamp),
      route.operator_ref.toString(),
      route.route_short_name,
      signal,
    )
      .then((routes) => setAvailableRoutes(routes))
      .catch((err) => {
        console.error(err)
        controller.abort()
      })

    return () => controller.abort()
  }, [route])

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
        <Grid xs={12} sm={4} className="inputs">
          <DateSelector
            time={moment(timestamp)}
            onChange={(ts) => setSearch((current) => ({ ...current, timestamp: ts.valueOf() }))}
          />
          <RouteSelector
            routes={availableRoutes ?? []}
            routeKey={selectedRouteKey}
            setRouteKey={(routeKey) => setSelectedRouteKey(routeKey)}
          />
          <div className="startTime">
            {locationsAreLoading && (
              <Tooltip title={t('loading_times_tooltip_content')}>
                <Spin />
              </Tooltip>
            )}
            <FilterPositionsByStartTimeSelector
              options={options}
              startTime={startTime}
              setStartTime={setStartTime}
            />
          </div>
        </Grid>
        <Grid xs={12} sm={8}>
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

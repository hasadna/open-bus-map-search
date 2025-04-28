import { CircularProgress, Grid } from '@mui/material'
import { Tooltip } from 'antd'
import moment from 'moment'
import { GtfsRoutePydanticModel } from 'open-bus-stride-client'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import './LineProfile.scss'
import { LineProfileDetails } from './LineProfileDetails'
import LineProfileHeader from './LineProfileHeader'
import { getRoutesAsync } from 'src/api/gtfsService'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import { SearchContext, TimelinePageState } from 'src/model/pageState'
import StopSelector from 'src/pages/components/StopSelector'
import Widget from 'src/shared/Widget'

const LineProfileWrapper = () => (
  <PageContainer className="line-data-container">
    <LineProfile />
  </PageContainer>
)

const LineProfile = () => {
  const { t } = useTranslation()
  const { route, message } = useLoaderData<{ route?: GtfsRoutePydanticModel; message?: string }>()
  const { setSearch } = useContext(SearchContext)
  const [{ stopKey }, setState] = useState<TimelinePageState>({})

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!route?.id) {
      return
    }
    const abortController = new AbortController()
    const time = moment(route.date)
    getRoutesAsync(
      time,
      time,
      route.operatorRef.toString(),
      route.routeShortName,
      abortController.signal,
    )
      .then((routes) => {
        setState({})
        setSearch(() => ({
          timestamp: time.valueOf(),
          operatorId: route.operatorRef.toString(),
          lineNumber: route.routeShortName,
          routes,
          routeKey: route.routeLongName,
        }))
      })
      .catch((error) => console.error(error))

    return () => {
      abortController.abort()
    }
  }, [route?.id])

  const routeIds = useMemo(() => (route?.id ? [route?.id] : undefined), [route?.id])

  const {
    filteredPositions,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    setStartTime,
  } = useSingleLineData(route?.lineRef, routeIds, route?.date.getTime())

  if (!route || message)
    return (
      <NotFound>
        <Widget>
          <h1>{t('lineProfile.notFound')}</h1>
          <pre>{message}</pre>
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
          <Widget>
            <div>journey id {filteredPositions[0]?.point?.siri_ride__journey_ref}</div>
            <div>car id {filteredPositions[0]?.point?.siri_ride__vehicle_ref}</div>
            <div>{filteredPositions[0]?.point?.siri_ride__duration_minutes}min</div>
            <div>ride id {filteredPositions[0]?.point?.siri_ride__id}</div>
            <div>
              {moment(
                filteredPositions[0]?.point?.siri_ride__scheduled_start_time,
              ).toLocaleString()}
            </div>
          </Widget>

          <Widget>
            {plannedRouteStops?.map((b) => {
              if (b.key === stopKey) {
                return (
                  <>
                    <div>{b.name}</div>
                    <div>{b.code}</div>
                    <div>
                      {b.location.latitude} - {b.location.longitude}
                    </div>
                  </>
                )
              }
            })}
          </Widget>
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

import { CircularProgress, Grid } from '@mui/material'
import { Tooltip } from 'antd'
import { GtfsRoutePydanticModel } from 'open-bus-stride-client'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate } from 'react-router'
import { DateSelector } from '../components/DateSelector'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import RouteSelector from '../components/RouteSelector'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { LineProfileDetails } from './LineProfileDetails'
import { LineProfileRide } from './LineProfileRide'
import { LineProfileStop } from './LineProfileStop'
import { getRoutesAsync } from 'src/api/gtfsService'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import { SearchContext, TimelinePageState } from 'src/model/pageState'
import StopSelector from 'src/pages/components/StopSelector'
import Widget from 'src/shared/Widget'
import dayjs from 'src/dayjs'
import './LineProfile.scss'

const LineProfile = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { route, message } = useLoaderData<{ route?: GtfsRoutePydanticModel; message?: string }>()
  const [{ stopKey }, setState] = useState<TimelinePageState>({})
  const {
    search: { timestamp, routes },
    setSearch,
  } = useContext(SearchContext)

  useEffect(() => {
    document.querySelector('main')?.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!route?.id) return

    const abortController = new AbortController()
    const time = dayjs(route.date)
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
          timestamp: route.date.getTime(),
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

  const routeIds = useMemo(() => (route?.id ? [route.id] : undefined), [route?.id])

  const { positions, locationsAreLoading, options, plannedRouteStops, startTime, setStartTime } =
    useSingleLineData(route?.lineRef, routeIds)

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    if (!time || !route) return

    const abortController = new AbortController()
    getRoutesAsync(
      time,
      time,
      route?.operatorRef.toString(),
      route?.routeShortName,
      abortController.signal,
    )
      .then((routes) => {
        const newRoute = routes?.find((route) => route.key === route.key)
        if (newRoute?.routeIds?.[0]) {
          navigate(`/profile/${newRoute.routeIds[0]}`)
        }
      })
      .catch((error) => console.error(error))
  }

  const handelRouteChange = (key?: string) => {
    if (!key || !routes) return
    const newRoute = routes?.find((route) => route.key === key)
    if (newRoute?.routeIds?.[0]) {
      navigate(`/profile/${newRoute.routeIds[0]}`)
    }
  }

  const handelStopChange = (key?: string) => {
    const stop = plannedRouteStops?.find((stop) => stop.key === key)
    setState((current) => ({ ...current, stopKey: key, stopName: stop?.name }))
  }

  if (message || !route) {
    return <LineProfileError title={t('lineProfile.notFound')} message={message} />
  }

  return (
    <PageContainer className="line-profile-container">
      <Grid container spacing={2} sx={{ marginTop: '0.5rem' }}>
        <Grid size={{ xs: 12, lg: 7 }} container spacing={2} flexDirection="column">
          <LineProfileDetails {...route} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} container spacing={2} flexDirection="column">
          <RouteSelector
            routes={routes ?? []}
            routeKey={route.routeLongName}
            setRouteKey={handelRouteChange}
          />
          <DateSelector time={dayjs(timestamp)} onChange={handleTimestampChange} />
          <Grid container flexWrap="nowrap" alignItems="center">
            <FilterPositionsByStartTimeSelector
              options={options}
              startTime={startTime}
              setStartTime={setStartTime}
            />
            {locationsAreLoading && (
              <Tooltip title={t('loading_times_tooltip_content')}>
                <CircularProgress />
              </Tooltip>
            )}
          </Grid>
          <LineProfileRide point={positions[0]?.point} />
          <StopSelector stops={plannedRouteStops} stopKey={stopKey} setStopKey={handelStopChange} />
          <LineProfileStop
            stop={plannedRouteStops.find((s) => s.key === stopKey)}
            total={plannedRouteStops.length}
          />
        </Grid>
      </Grid>
      <MapWithLocationsAndPath positions={positions} plannedRouteStops={plannedRouteStops} />
    </PageContainer>
  )
}

export default LineProfile

const LineProfileError = ({ title, message }: { title?: string; message?: string }) => {
  return (
    <PageContainer>
      <NotFound>
        <Widget>
          <h1>{title}</h1>
          <pre>{message}</pre>
        </Widget>
      </NotFound>
    </PageContainer>
  )
}

import { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import { CircularProgress, Grid } from '@mui/material'
import { Tooltip } from 'antd'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate } from 'react-router'
import { getServiceDayRoutes } from 'src/api/serviceDayRoutesService'
import dayjs, { toIsraelTimezone } from 'src/dayjs'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import { GLOBAL_SEARCH_DEFAULTS, GlobalSearchContext } from 'src/model/globalState'
import { ExtraShareParamsContext, InitialUrlParamsContext } from 'src/model/routeContext'
import StopSelector from 'src/pages/components/StopSelector'
import Widget from 'src/shared/Widget'
import { DateSelector } from '../components/DateSelector'
import { FilterPositionsByStartTimeSelector } from '../components/FilterPositionsByStartTimeSelector'
import { MapWithLocationsAndPath } from '../components/map-related/MapWithLocationsAndPath'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import RouteSelector from '../components/RouteSelector'
import { LineProfileDetails } from './LineProfileDetails'
import { LineProfileRide } from './LineProfileRide'
import { LineProfileStop } from './LineProfileStop'

const LineProfile = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { route, message } = useLoaderData<{ route?: GtfsRoutePydanticModel; message?: string }>()
  const [stopKey, setState] = useState<string>()
  const { search, setSearch } = useContext(GlobalSearchContext)
  const initialUrlParams = useContext(InitialUrlParamsContext)
  const { setParams } = useContext(ExtraShareParamsContext)

  useEffect(() => {
    document.querySelector('main')?.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    setState(undefined)
    if (!route?.id) {
      return
    }
    setSearch(() => ({
      ...GLOBAL_SEARCH_DEFAULTS,
      date: toIsraelTimezone(route.date.getTime()).format('YYYY-MM-DD'),
      operatorId: route.operatorRef.toString(),
      lineNumber: route.routeShortName ?? null,
      routeKey: `${route.routeMkt}-${route.routeDirection}-${route.routeAlternative}`,
      rideTime: initialUrlParams.rideTime ?? initialUrlParams.startTime ?? null,
    }))
  }, [route?.id])

  const onRouteKeyChange = useCallback(
    (key: string | null) => setSearch((c) => ({ ...c, routeKey: key })),
    [setSearch],
  )
  const onRideTimeChange = useCallback(
    (time: string | null) => setSearch((c) => ({ ...c, rideTime: time })),
    [setSearch],
  )

  const {
    positions,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    routes,
    routeKey,
    setStartTime,
  } = useSingleLineData({
    operatorId: route?.operatorRef.toString(),
    lineNumber: route?.routeShortName,
    date: search.date,
    routeKey: search.routeKey,
    rideTime: search.rideTime,
    onRouteKeyChange,
    onRideTimeChange,
  })

  useEffect(() => {
    if (startTime) setParams({ startTime })
    else setParams({})
    return () => setParams({})
  }, [startTime, setParams])

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    if (!time || !route) return

    const abortController = new AbortController()
    // Service-day aware (and Israel-tz normalized internally), consistent with the
    // gaps page and the single-line ride list.
    getServiceDayRoutes(
      time,
      route?.operatorRef.toString(),
      route?.routeShortName,
      abortController.signal,
    )
      .then((routes) => {
        const newRoute = routes?.find(
          (r) => r.key === `${route.routeMkt}-${route.routeDirection}-${route.routeAlternative}`,
        )
        if (newRoute?.routeIds?.[0]) {
          void navigate(`/profile/${newRoute.routeIds[0]}`)
        }
      })
      .catch((error) => console.error(error))
  }

  const handelRouteChange = (key?: string) => {
    if (!key || !routes) return
    const newRoute = routes?.find((route) => route.key === key)
    if (newRoute?.routeIds?.[0]) {
      void navigate(`/profile/${newRoute.routeIds[0]}`)
    }
  }

  const handelStopChange = (key?: string) => {
    const stop = plannedRouteStops?.find((stop) => stop.key === key)
    setState(stop?.key)
  }

  if (message || !route) {
    return <LineProfileError title={t('lineProfile.notFound')} message={message} />
  }

  return (
    <PageContainer className="map-container">
      <Grid container spacing={2} sx={{ marginTop: '0.5rem' }}>
        <Grid size={{ xs: 12, lg: 7 }} container spacing={2} sx={{ flexDirection: 'column' }}>
          <LineProfileDetails {...route} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} container spacing={2} sx={{ flexDirection: 'column' }}>
          <RouteSelector
            routes={routes ?? []}
            routeKey={routeKey}
            setRouteKey={handelRouteChange}
          />
          <DateSelector time={dayjs(route?.date.getTime())} onChange={handleTimestampChange} />
          <Grid container sx={{ flexWrap: 'nowrap', alignItems: 'center' }}>
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
        <Widget title={title}>
          <pre>{message}</pre>
        </Widget>
      </NotFound>
    </PageContainer>
  )
}

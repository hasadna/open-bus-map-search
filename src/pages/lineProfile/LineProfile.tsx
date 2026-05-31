import { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import { CircularProgress, Grid } from '@mui/material'
import { Tooltip } from 'antd'
import { useCallback, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate } from 'react-router'
import { getRoutesAsync } from 'src/api/gtfsService'
import dayjs, { toIsraelTimezone } from 'src/dayjs'
import { usePageState } from 'src/hooks/usePageState'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import { GlobalSearchContext } from 'src/model/globalState'
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
import './LineProfile.scss'

const LineProfile = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { route, message } = useLoaderData<{ route?: GtfsRoutePydanticModel; message?: string }>()
  const { search, setSearch } = useContext(GlobalSearchContext)

  // stopKey is in global state — shared with /timeline so selecting a stop
  // there and navigating here (or vice versa) preserves the selection.
  const stopKey = search.stopKey
  const setStopKey = (key: string | undefined) =>
    setSearch((prev) => ({ ...prev, stopKey: key ?? null }))

  // Shares the 'line-view' storage slot with /single-line-map — same route,
  // same map, so the viewport should persist when navigating between them.
  // rideTime is in page params so it's included in the share URL.
  const {
    setParams: setPageParams,
    ui,
    setUi,
  } = usePageState(
    'line-view',
    {
      params: { mode: 'routes' as const, rideTime: null as string | null },
      ui: { isExpanded: false, scrollPosition: 0, centerLat: 0, centerLng: 0, zoom: 13 },
    },
    ['rideTime'],
  )

  useEffect(() => {
    setStopKey(undefined)
    if (!route?.id) return
    setSearch(() => ({
      date: toIsraelTimezone(route.date.getTime()).format('YYYY-MM-DD'),
      operatorId: route.operatorRef.toString(),
      lineNumber: route.routeShortName,
      routeKey: `${route.routeMkt}-${route.routeDirection}`,
      vehicleNumber: null,
      rideTime: null,
      stopKey: null,
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

  // Keep rideTime in page params so the share button produces a link that
  // restores the same selected ride for the recipient.
  useEffect(() => {
    setPageParams((prev) => ({ ...prev, rideTime: startTime ?? null }))
  }, [startTime])

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    if (!time || !route) return
    const abortController = new AbortController()
    getRoutesAsync(
      time,
      time,
      route.operatorRef.toString(),
      route.routeShortName,
      abortController.signal,
    )
      .then((routes) => {
        const newRoute = routes?.find(
          (r) => r.key === `${route.routeMkt}-${route.routeDirection}-${route.routeAlternative}`,
        )
        if (newRoute?.routeIds?.[0]) {
          navigate(`/profile/${newRoute.routeIds[0]}`)
        }
      })
      .catch((error) => console.error(error))
  }

  const handleRouteChange = (key?: string) => {
    if (!key || !routes) return
    const newRoute = routes.find((r) => r.key === key)
    if (newRoute?.routeIds?.[0]) {
      navigate(`/profile/${newRoute.routeIds[0]}`)
    }
  }

  const handleStopChange = (key?: string) => {
    const stop = plannedRouteStops?.find((s) => s.key === key)
    setStopKey(stop?.key)
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
            routeKey={routeKey}
            setRouteKey={handleRouteChange}
          />
          <DateSelector time={dayjs(route?.date.getTime())} onChange={handleDateChange} />
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
          <StopSelector
            stops={plannedRouteStops}
            stopKey={stopKey ?? undefined}
            setStopKey={handleStopChange}
          />
          <LineProfileStop
            stop={plannedRouteStops.find((s) => s.key === stopKey)}
            total={plannedRouteStops.length}
          />
        </Grid>
      </Grid>
      <MapWithLocationsAndPath
        positions={positions}
        plannedRouteStops={plannedRouteStops}
        isExpanded={ui.isExpanded}
        onToggleExpanded={() => setUi((prev) => ({ ...prev, isExpanded: !prev.isExpanded }))}
        centerLat={ui.centerLat || undefined}
        centerLng={ui.centerLng || undefined}
        zoom={ui.zoom || undefined}
        onViewportChange={(centerLat, centerLng, zoom) =>
          setUi((prev) => ({ ...prev, centerLat, centerLng, zoom }))
        }
        routeIdentity={`${route?.operatorRef}:${routeKey}`}
      />
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

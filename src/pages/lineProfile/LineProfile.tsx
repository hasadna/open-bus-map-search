import { CircularProgress, Grid } from '@mui/material'
import { Tooltip } from 'antd'
import { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import { useContext, useEffect, useState } from 'react'
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
import { getGTFSRoutes } from 'src/api/gtfsService'
import { useSingleLineData } from 'src/hooks/useSingleLineData'
import { SearchContext } from 'src/model/pageState'
import StopSelector from 'src/pages/components/StopSelector'
import Widget from 'src/shared/Widget'
import dayjs from 'src/dayjs'
import './LineProfile.scss'

const LineProfile = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { route, message } = useLoaderData<{ route?: GtfsRoutePydanticModel; message?: string }>()
  const [stopKey, setState] = useState<string>()
  const { setSearch } = useContext(SearchContext)

  useEffect(() => {
    document.querySelector('main')?.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    setState(undefined)
    if (!route?.id) {
      return
    }
    setSearch(() => ({
      timestamp: route.date.getTime(),
      operatorId: route.operatorRef.toString(),
      lineNumber: route.routeShortName,
      routes,
      routeKey: route.routeLongName,
    }))
    setRouteKey(route.routeLongName)
  }, [route?.id])

  const {
    positions,
    locationsAreLoading,
    options,
    plannedRouteStops,
    startTime,
    routes,
    routeKey,
    setStartTime,
    setRouteKey,
  } = useSingleLineData(route?.operatorRef.toString(), route?.routeShortName)

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    if (!time || !route) return

    const abortController = new AbortController()
    getGTFSRoutes({
      from: time.valueOf(),
      operatorId: route?.operatorRef.toString(),
      routeShortName: route?.routeShortName,
      signal: abortController.signal,
      toBusRoute: true,
    })
      .then((routes) => {
        const newRoute = routes?.find((r) => r.key === route.routeLongName)
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
    setState(stop?.key)
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
            setRouteKey={handelRouteChange}
          />
          <DateSelector time={dayjs(route?.date.getTime())} onChange={handleTimestampChange} />
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

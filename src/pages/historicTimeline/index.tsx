import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { Grid, Typography, Alert, CircularProgress } from '@mui/material'
import { PageContainer } from '../components/PageContainer'
import { SearchContext, TimelinePageState } from '../../model/pageState'
import { NotFound } from '../components/NotFound'
import { DateSelector } from '../components/DateSelector'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { Row } from 'src/pages/components/Row'
import { INPUT_SIZE, MARGIN_MEDIUM } from 'src/resources/sizes'
import 'src/App.scss'

import {
  getGtfsStopHitTimesAsync,
  getRoutesAsync,
  getStopsForRouteAsync,
} from 'src/api/gtfsService'
import RouteSelector from 'src/pages/components/RouteSelector'
import { Label } from 'src/pages/components/Label'
import StopSelector from 'src/pages/components/StopSelector'
import { getSiriStopHitTimesAsync } from 'src/api/siriService'
import { TimelineBoard } from 'src/pages/components/timeline/TimelineBoard'

const StyledTimelineBoard = styled(TimelineBoard)`
  margin-top: ${MARGIN_MEDIUM * 3}px;
  margin-bottom: ${MARGIN_MEDIUM * 3}px;
`

const TimelinePage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [state, setState] = useState<TimelinePageState>({})
  const { stopKey, stopName, gtfsHitTimes, siriHitTimes, stops } = state

  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const [stopsIsLoading, setStopsIsLoading] = useState(false)
  const [hitsIsLoading, setHitsIsLoading] = useState(false)

  const clearRoutes = useCallback(() => {
    setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
    setRoutesIsLoading(false)
  }, [setSearch])

  const clearStops = useCallback(() => {
    setState((current) => ({
      ...current,
      stops: undefined,
      stopName: undefined,
      stopKey: undefined,
      gtfsHitTimes: undefined,
      siriHitTimes: undefined,
    }))
    setStopsIsLoading(false)
    setHitsIsLoading(false)
  }, [setState])

  useEffect(() => {
    clearRoutes()
  }, [clearRoutes, operatorId, lineNumber])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    clearStops()
    if (!operatorId || operatorId === '0' || !lineNumber) {
      return
    }
    setRoutesIsLoading(true)
    getRoutesAsync(dayjs(timestamp), dayjs(timestamp), operatorId, lineNumber, signal)
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .catch((err) => console.error(err?.message ?? err))
      .finally(() => setRoutesIsLoading(false))
    return () => controller.abort()
  }, [operatorId, lineNumber, clearRoutes, clearStops, timestamp, setState])

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )
  const selectedRouteIds = selectedRoute?.routeIds

  useEffect(() => {
    clearStops()
    if (!operatorId || operatorId === '0' || !lineNumber) {
      return
    }
    if (!routeKey || !selectedRouteIds) {
      return
    }
    setStopsIsLoading(true)
    getStopsForRouteAsync(selectedRouteIds, dayjs(timestamp))
      .then((stops) => setState((current) => ({ ...current, stops: stops })))
      .finally(() => setStopsIsLoading(false))
  }, [selectedRouteIds, routeKey, clearStops])

  useEffect(() => {
    if (!operatorId || operatorId === '0' || !lineNumber) {
      return
    }
    if (!stopKey || !stops || !selectedRoute) {
      return
    }
    const stop = stops?.find((stop) => stop.key === stopKey)
    if (stop) {
      setHitsIsLoading(true)
      Promise.all([
        getGtfsStopHitTimesAsync(stop, dayjs(timestamp)),
        getSiriStopHitTimesAsync(selectedRoute, stop, dayjs(timestamp)),
      ])
        .then(([gtfsTimes, siriTimes]) =>
          setState((current) => ({ ...current, gtfsHitTimes: gtfsTimes, siriHitTimes: siriTimes })),
        )
        .finally(() => setHitsIsLoading(false))
    }
  }, [stopKey, stops, timestamp, selectedRoute])

  useEffect(() => {
    if (!operatorId || operatorId === '0' || !lineNumber) {
      return
    }
    if (!stopName || !stops || stopKey) {
      return
    }
    const newStopKey = stops.find((stop) => stop.name === stopName)?.key
    if (newStopKey) {
      setState((current) => ({ ...current, stopKey: newStopKey }))
    }
  }, [timestamp, stops])

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        {t('timeline_page_title')}
      </Typography>

      <Alert severity="info" variant="outlined" icon={false}>
        {t('timeline_page_description')}
      </Alert>

      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        {/* choose date */}
        <Grid size={{ xs: 4 }} className="hideOnMobile">
          <Label text={t('choose_date')} />
        </Grid>
        <Grid size={{ sm: 8, xs: 12 }}>
          <DateSelector
            time={dayjs(timestamp)}
            onChange={(ts) =>
              setSearch((current) => ({ ...current, timestamp: ts ? ts.valueOf() : 0 }))
            }
          />
        </Grid>
        {/* choose operator */}
        <Grid size={{ xs: 4 }} className="hideOnMobile">
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid size={{ sm: 8, xs: 12 }}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        {/* choose line */}
        <Grid size={{ xs: 4 }} className="hideOnMobile">
          <Label text={t('choose_line')} />
        </Grid>
        <Grid size={{ sm: 8, xs: 12 }}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>
        {/* routes */}
        <Grid size={{ xs: 12 }}>
          {routesIsLoading && (
            <Row>
              <Label text={t('loading_routes')} />
              <CircularProgress />
            </Row>
          )}
          {!routesIsLoading &&
            routes &&
            (routes.length === 0 ? (
              <NotFound>{t('line_not_found')}</NotFound>
            ) : (
              <RouteSelector
                routes={routes}
                routeKey={routeKey}
                setRouteKey={(key) => setSearch((current) => ({ ...current, routeKey: key }))}
              />
            ))}
        </Grid>
        {/* stops */}
        <Grid size={{ xs: 12 }}>
          {stopsIsLoading && (
            <Row>
              <Label text={t('loading_stops')} />
              <CircularProgress />
            </Row>
          )}
          {!stopsIsLoading && stops && (
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
        </Grid>
        {/* its Loading */}
        <Grid size={{ xs: 12 }}>
          {hitsIsLoading && (
            <Row>
              <Label text={t('loading_hits')} />
              <CircularProgress />
            </Row>
          )}
        </Grid>
      </Grid>
      {!hitsIsLoading &&
        gtfsHitTimes !== undefined &&
        siriHitTimes !== undefined &&
        (gtfsHitTimes.length > 0 || siriHitTimes.length > 0 ? (
          <StyledTimelineBoard
            target={dayjs(timestamp)}
            gtfsTimes={gtfsHitTimes}
            siriTimes={siriHitTimes}
          />
        ) : (
          <NotFound>{t('hits_not_found')}</NotFound>
        ))}
    </PageContainer>
  )
}

export default TimelinePage

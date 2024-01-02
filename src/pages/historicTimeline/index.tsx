import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { Row } from 'src/pages/components/Row'
import { INPUT_SIZE, MARGIN_MEDIUM } from 'src/resources/sizes'
import styled from 'styled-components'
import 'src/App.scss'

import {
  getGtfsStopHitTimesAsync,
  getRoutesAsync,
  getStopsForRouteAsync,
} from 'src/api/gtfsService'
import RouteSelector from 'src/pages/components/RouteSelector'
import { Label } from 'src/pages/components/Label'
import { useTranslation } from 'react-i18next'
import StopSelector from 'src/pages/components/StopSelector'
import { Spin, Typography, Alert } from 'antd'
import { getSiriStopHitTimesAsync } from 'src/api/siriService'
import { TimelineBoard } from 'src/pages/components/timeline/TimelineBoard'
import { PageContainer } from '../components/PageContainer'
import { SearchContext, TimelinePageState } from '../../model/pageState'
import { NotFound } from '../components/NotFound'
import moment from 'moment'
import { DateSelector } from '../components/DateSelector'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2

const { Title } = Typography

const StyledTimelineBoard = styled(TimelineBoard)`
  margin-top: ${MARGIN_MEDIUM * 3}px;
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
    getRoutesAsync(moment(timestamp), moment(timestamp), operatorId, lineNumber, signal)
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .catch((err) => console.error(err.message))
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
    getStopsForRouteAsync(selectedRouteIds, moment(timestamp))
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
        getGtfsStopHitTimesAsync(stop, moment(timestamp)),
        getSiriStopHitTimesAsync(selectedRoute, stop, moment(timestamp)),
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
      <Title className="page-title" level={3}>
        הסטוריית נסיעות
      </Title>
      <Alert message="רשימת זמני עצירה בתחנה שנבחרה" type="info" />
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        {/* choose date */}
        <Grid xs={4} className="hideOnMobile">
          <Label text={t('choose_date')} />
        </Grid>
        <Grid sm={8} xs={12}>
          <DateSelector
            time={moment(timestamp)}
            onChange={(ts) =>
              setSearch((current) => ({ ...current, timestamp: ts ? ts.valueOf() : 0 }))
            }
          />
        </Grid>
        {/* choose operator */}
        <Grid xs={4} className="hideOnMobile">
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid sm={8} xs={12}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        {/* choose line */}
        <Grid xs={4} className="hideOnMobile">
          <Label text={t('choose_line')} />
        </Grid>
        <Grid sm={8} xs={12}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>
        {/* routes */}
        <Grid xs={12}>
          {routesIsLoading && (
            <Row>
              <Label text={t('loading_routes')} />
              <Spin />
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
        <Grid xs={12}>
          {stopsIsLoading && (
            <Row>
              <Label text={t('loading_stops')} />
              <Spin />
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
        <Grid xs={12}>
          {hitsIsLoading && (
            <Row>
              <Label text={t('loading_hits')} />
              <Spin />
            </Row>
          )}
        </Grid>
      </Grid>
      {!hitsIsLoading &&
        gtfsHitTimes !== undefined &&
        siriHitTimes !== undefined &&
        (gtfsHitTimes.length > 0 || siriHitTimes.length > 0 ? (
          <StyledTimelineBoard
            target={moment(timestamp)}
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

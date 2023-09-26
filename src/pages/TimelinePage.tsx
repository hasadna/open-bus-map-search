import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { Row } from 'src/pages/components/Row'
import { INPUT_SIZE, MARGIN_MEDIUM } from 'src/resources/sizes'
import styled from 'styled-components'
import {
  getGtfsStopHitTimesAsync,
  getRoutesAsync,
  getStopsForRouteAsync,
} from 'src/api/gtfsService'
import RouteSelector from 'src/pages/components/RouteSelector'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import StopSelector from 'src/pages/components/StopSelector'
import { Spin } from 'antd'
import { getSiriStopHitTimesAsync } from 'src/api/siriService'
import { TimelineBoard } from 'src/pages/components/timeline/TimelineBoard'
import { log } from 'src/log'
import { PageContainer } from './components/PageContainer'
import { SearchContext, TimelinePageState } from '../model/pageState'
import { NotFound } from './components/NotFound'
import moment from 'moment'
import { DataSelector } from './components/DataSelector'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import { GridSelectorAndLabel } from './components/GridSelectorAndLabel'

const StyledTimelineBoard = styled(TimelineBoard)`
  margin-top: ${MARGIN_MEDIUM * 3}px;
`

const TimelinePage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [state, setState] = useState<TimelinePageState>({})
  const { stopKey, stopName, gtfsHitTimes, siriHitTimes, stops } = state

  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const [stopsIsLoading, setStopsIsLoading] = useState(false)
  const [hitsIsLoading, setHitsIsLoading] = useState(false)

  const clearRoutes = useCallback(() => {
    setState((current) => ({ ...current, routes: undefined, routeKey: undefined }))
  }, [setState])

  const clearStops = useCallback(() => {
    setState((current) => ({
      ...current,
      stops: undefined,
      stopKey: undefined,
      gtfsHitTimes: undefined,
      siriHitTimes: undefined,
    }))
  }, [setState])

  useEffect(() => {
    clearRoutes()
  }, [clearRoutes, operatorId, lineNumber])

  useEffect(() => {
    clearStops()
    if (!operatorId || !lineNumber) {
      return
    }
    setRoutesIsLoading(true)
    getRoutesAsync(moment(timestamp), operatorId, lineNumber)
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .finally(() => setRoutesIsLoading(false))
  }, [operatorId, lineNumber, clearRoutes, clearStops, timestamp, setState])

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )
  const selectedRouteIds = selectedRoute?.routeIds

  useEffect(() => {
    clearStops()
    if (!routeKey || !selectedRouteIds) {
      return
    }
    setStopsIsLoading(true)
    getStopsForRouteAsync(selectedRouteIds, moment(timestamp))
      .then((stops) => setState((current) => ({ ...current, stops: stops })))
      .finally(() => setStopsIsLoading(false))
  }, [selectedRouteIds, routeKey, clearStops])

  useEffect(() => {
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
    if (!stopName || !stops || stopKey) {
      return
    }
    const newStopKey = stops.find((stop) => stop.name === stopName)?.key
    if (newStopKey) {
      log(`setting new stopKey=${newStopKey} using the prev stopName=${stopName}`)
      setState((current) => ({ ...current, stopKey: newStopKey }))
    }
  }, [timestamp, stops])

  return (
    <PageContainer>
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        {/* choose date */}
        <GridSelectorAndLabel label={TEXTS.choose_date}>
          <DataSelector
            timeValid={moment(timestamp)}
            setTimeValid={(ts) =>
              setSearch((current) => ({ ...current, timestamp: ts ? ts.valueOf() : 0 }))
            }
          />
        </GridSelectorAndLabel>
        {/* choose operator */}
        <GridSelectorAndLabel label={TEXTS.choose_operator}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </GridSelectorAndLabel>
        {/* choose line */}
        <GridSelectorAndLabel label={TEXTS.choose_line}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </GridSelectorAndLabel>
        {/* routes */}
        <Grid xs={12}>
          {routesIsLoading && (
            <Row>
              <Label text={TEXTS.loading_routes} />
              <Spin />
            </Row>
          )}
          {!routesIsLoading &&
            routes &&
            (routes.length === 0 ? (
              <NotFound>{TEXTS.line_not_found}</NotFound>
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
              <Label text={TEXTS.loading_stops} />
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
              <Label text={TEXTS.loading_hits} />
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
          <NotFound>{TEXTS.hits_not_found}</NotFound>
        ))}
    </PageContainer>
  )
}

export default TimelinePage

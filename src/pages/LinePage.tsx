import React, { useCallback, useEffect, useMemo, useState } from 'react'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { Row } from 'src/pages/components/Row'
import { MARGIN_MEDIUM } from 'src/resources/sizes'
import styled from 'styled-components'
import {
  getGtfsStopHitTimesAsync,
  getRoutesAsync,
  getStopsForRouteAsync,
} from 'src/api/gtfsService'
import RouteSelector from 'src/pages/components/RouteSelector'
import moment from 'moment'
import DateTimePicker from 'src/pages/components/DateTimePicker'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import StopSelector from 'src/pages/components/StopSelector'
import { Spin } from 'antd'
import { getSiriStopHitTimesAsync } from 'src/api/siriService'
import { TimelineBoard } from 'src/pages/components/timeline/TimelineBoard'
import { LinePageState } from 'src/model/linePageState'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${MARGIN_MEDIUM}px;
  z-index: -2;
`

const StyledTimelineBoard = styled(TimelineBoard)`
  margin-top: ${MARGIN_MEDIUM * 3}px;
`

const NotFound = styled.div`
  color: #710825;
`

const LinePage = () => {
  const [state, setState] = useState<LinePageState>({ timestamp: moment() })
  const {
    operatorId,
    lineNumber,
    routeKey,
    timestamp,
    stopKey,
    stopName,
    gtfsHitTimes,
    siriHitTimes,
    routes,
    stops,
  } = state

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
    getRoutesAsync(timestamp, operatorId, lineNumber)
      .then((routes) =>
        setState((current) =>
          current.lineNumber === lineNumber ? { ...current, routes: routes } : current,
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
    getStopsForRouteAsync(selectedRouteIds, timestamp)
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
        getGtfsStopHitTimesAsync(stop, timestamp),
        getSiriStopHitTimesAsync(selectedRoute, stop, timestamp),
      ])
        .then(([gtfsTimes, siriTimes]) =>
          setState((current) => ({ ...current, gtfsHitTimes: gtfsTimes, siriHitTimes: siriTimes })),
        )
        .finally(() => setHitsIsLoading(false))
    }
  }, [stopKey, stops, timestamp, selectedRoute])

  useEffect(() => {
    console.error('looking up stops to match new day', stopName)
    if (!stopName || !stops || stopKey) {
      return
    }
    const newStopKey = stops.find((stop) => stop.name === stopName)?.key
    console.error(stopName, newStopKey)
    if (newStopKey) {
      setState((current) => ({ ...current, stopKey: newStopKey }))
    }
  }, [timestamp, stops])

  return (
    <Container>
      <Row>
        <Label text={TEXTS.choose_datetime} />
        <DateTimePicker
          timestamp={timestamp}
          setDateTime={(ts) => setState((current) => ({ ...current, timestamp: ts }))}
        />
      </Row>
      <Row>
        <Label text={TEXTS.choose_operator} />
        <OperatorSelector
          operatorId={operatorId}
          setOperatorId={(id) => setState((current) => ({ ...current, operatorId: id }))}
        />
      </Row>
      <Row>
        <Label text={TEXTS.choose_line} />
        <LineNumberSelector
          lineNumber={lineNumber}
          setLineNumber={(number) => setState((current) => ({ ...current, lineNumber: number }))}
        />
      </Row>
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
            setRouteKey={(key) => setState((current) => ({ ...current, routeKey: key }))}
          />
        ))}
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
      {hitsIsLoading && (
        <Row>
          <Label text={TEXTS.loading_hits} />
          <Spin />
        </Row>
      )}
      {!hitsIsLoading &&
        gtfsHitTimes &&
        siriHitTimes &&
        (gtfsHitTimes.length > 0 && siriHitTimes.length > 0 ? (
          <StyledTimelineBoard
            target={timestamp}
            gtfsTimes={gtfsHitTimes}
            siriTimes={siriHitTimes}
          />
        ) : (
          <NotFound>{TEXTS.hits_not_found}</NotFound>
        ))}
    </Container>
  )
}

export default LinePage

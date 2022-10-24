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
import { BusRoute } from 'src/model/busRoute'
import RouteSelector from 'src/pages/components/RouteSelector'
import moment, { Moment } from 'moment'
import DateTimePicker from 'src/pages/components/DateTimePicker'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import { BusStop } from 'src/model/busStop'
import StopSelector from 'src/pages/components/StopSelector'
import { Spin } from 'antd'
import { getSiriStopHitTimesAsync } from 'src/api/siriService'
import { TimelineBoard } from 'src/pages/components/timeline/TimelineBoard'

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
  const [operatorId, setOperatorId] = useState<string | undefined>()
  const [lineNumber, setLineNumber] = useState<string | undefined>()
  const [routeKey, setRouteKey] = useState<string | undefined>()
  const [timestamp, setTimestamp] = useState<Moment>(moment())
  const [stopKey, setStopKey] = useState<string | undefined>()
  const [gtfsHitTimes, setGtfsHitTimes] = useState<Date[] | undefined>()
  const [siriHitTimes, setSiriHitTimes] = useState<Date[] | undefined>()

  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const [stops, setStops] = useState<BusStop[] | undefined>()
  const [stopsIsLoading, setStopsIsLoading] = useState(false)
  const [hitsIsLoading, setHitsIsLoading] = useState(false)

  const clearRoutes = useCallback(() => {
    setRoutes(undefined)
    setRouteKey(undefined)
  }, [setRoutes, setRouteKey])

  const clearStops = useCallback(() => {
    setStops(undefined)
    setStopKey(undefined)
    setGtfsHitTimes(undefined)
  }, [setStops, setStopKey])

  useEffect(() => {
    clearRoutes()
    clearStops()
    if (!operatorId || !lineNumber) {
      return
    }
    getRoutesAsync(timestamp, operatorId, lineNumber)
      .then((lines) => setRoutes(lines))
      .finally(() => setRoutesIsLoading(false))
  }, [operatorId, lineNumber, clearRoutes, clearStops, timestamp])

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
      .then((stops) => setStops(stops))
      .finally(() => setStopsIsLoading(false))
  }, [selectedRouteIds, routeKey, clearStops, timestamp])

  useEffect(() => {
    if (!stopKey || !stops || !selectedRoute) {
      return
    }
    const stop = stops.find((stop) => stop.key === stopKey)
    if (stop) {
      setHitsIsLoading(true)
      Promise.all([
        getGtfsStopHitTimesAsync(stop, timestamp),
        getSiriStopHitTimesAsync(selectedRoute, stop, timestamp),
      ])
        .then(([gtfsTimes, siriTimes]) => {
          setGtfsHitTimes(gtfsTimes)
          setSiriHitTimes(siriTimes)
        })
        .finally(() => setHitsIsLoading(false))
    }
  }, [stopKey, stops, timestamp, selectedRoute])

  return (
    <Container>
      <Row>
        <Label text={TEXTS.choose_datetime} />
        <DateTimePicker timestamp={timestamp} setDateTime={setTimestamp} />
      </Row>
      <Row>
        <Label text={TEXTS.choose_operator} />
        <OperatorSelector operatorId={operatorId} setOperatorId={setOperatorId} />
      </Row>
      <Row>
        <Label text={TEXTS.choose_line} />
        <LineNumberSelector lineNumber={lineNumber} setLineNumber={setLineNumber} />
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
          <RouteSelector routes={routes} routeKey={routeKey} setRouteKey={setRouteKey} />
        ))}
      {stopsIsLoading && (
        <Row>
          <Label text={TEXTS.loading_stops} />
          <Spin />
        </Row>
      )}
      {!stopsIsLoading && stops && (
        <StopSelector stops={stops} stopKey={stopKey} setStopKey={setStopKey} />
      )}
      {hitsIsLoading && (
        <Row>
          <Label text={TEXTS.loading_hits} />
          <Spin />
        </Row>
      )}
      {gtfsHitTimes && siriHitTimes && (
        <StyledTimelineBoard target={timestamp} gtfsTimes={gtfsHitTimes} siriTimes={siriHitTimes} />
      )}
    </Container>
  )
}

export default LinePage

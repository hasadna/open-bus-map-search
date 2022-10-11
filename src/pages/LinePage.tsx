import React, { useCallback, useEffect, useState } from 'react'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { Row } from 'src/pages/components/Row'
import { MARGIN_MEDIUM } from 'src/resources/sizes'
import styled from 'styled-components'
import { getRoutesAsync, getStopHitTimesAsync, getStopsForRouteAsync } from 'src/api/gtfsService'
import { BusRoute } from 'src/model/busRoute'
import RouteSelector from 'src/pages/components/RouteSelector'
import moment, { Moment } from 'moment'
import { DateTimePicker } from 'src/pages/components/DateTimePickerProps'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import { BusStop } from 'src/model/busStop'
import StopSelector from 'src/pages/components/StopSelector'
import { Spin } from 'antd'
import { Timeline } from 'src/pages/components/Timeline'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${MARGIN_MEDIUM}px;
`

const StyledTimeline = styled(Timeline)`
  margin-top: ${MARGIN_MEDIUM * 2}px;
`

const LinePage = () => {
  const [operatorId, setOperatorId] = useState<string | undefined>()
  const [lineNumber, setLineNumber] = useState<string | undefined>()
  const [routeKey, setRouteKey] = useState<string | undefined>()
  const [timestamp, setTimestamp] = useState<Moment>(moment())
  const [stopKey, setStopKey] = useState<string | undefined>()
  const [hitTimes, setHitTimes] = useState<Date[] | undefined>()

  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const [stops, setStops] = useState<BusStop[] | undefined>()
  const [stopsIsLoading, setStopsIsLoading] = useState(false)

  const clearRoutes = useCallback(() => {
    setRoutes(undefined)
    setRouteKey(undefined)
  }, [setRoutes, setRouteKey])

  const clearStops = useCallback(() => {
    setStops(undefined)
    setStopKey(undefined)
    setHitTimes(undefined)
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

  const selectedRouteIds = routes?.find((route) => route.key === routeKey)?.routeIds

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
    if (!stopKey || !stops) {
      return
    }
    const stop = stops.find((stop) => stop.key === stopKey)
    if (stop) {
      getStopHitTimesAsync(stop, timestamp).then((times) => setHitTimes(times))
    }
  }, [stopKey, stops, timestamp])

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
      {!routesIsLoading && routes && (
        <RouteSelector routes={routes} routeKey={routeKey} setRouteKey={setRouteKey} />
      )}
      {stopsIsLoading && (
        <Row>
          <Label text={TEXTS.loading_stops} />
          <Spin />
        </Row>
      )}
      {!stopsIsLoading && stops && (
        <StopSelector stops={stops} stopKey={stopKey} setStopKey={setStopKey} />
      )}
      {hitTimes && <StyledTimeline target={timestamp} gtfsTimes={hitTimes} />}
    </Container>
  )
}

export default LinePage

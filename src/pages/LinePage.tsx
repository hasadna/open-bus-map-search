import React, { useCallback, useEffect, useState } from 'react'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { Row } from 'src/pages/components/Row'
import { MARGIN_MEDIUM } from 'src/resources/sizes'
import styled from 'styled-components'
import { getRoutesAsync, getStopsForRouteAsync } from 'src/api/gtfsService'
import { BusRoute } from 'src/model/busRoute'
import RouteSelector from 'src/pages/components/RouteSelector'
import moment, { Moment } from 'moment'
import { DateTimePicker } from 'src/pages/components/DateTimePickerProps'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import { BusStop } from 'src/model/busStop'
import StopSelector from 'src/pages/components/StopSelector'
import { Spin } from 'antd'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${MARGIN_MEDIUM}px;
`

const LinePage = () => {
  const [operatorId, setOperatorId] = useState<string | undefined>()
  const [lineNumber, setLineNumber] = useState<string | undefined>()
  const [routeKey, setRouteKey] = useState<string | undefined>()
  const [dateTime, setDateTime] = useState<Moment | undefined>(moment())
  const [stopKey, setStopKey] = useState<string | undefined>()

  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const [stops, setStops] = useState<BusStop[] | undefined>()
  const [stopsIsLoding, setStopsIsLoading] = useState(false)

  const momentForce = dateTime || moment()
  const dateTimeForce = momentForce.toDate()

  const clearRoutes = useCallback(() => {
    setRoutes(undefined)
    setRouteKey(undefined)
  }, [setRoutes, setRouteKey])

  const clearStops = useCallback(() => {
    setStops(undefined)
    setStopKey(undefined)
  }, [setStops, setStopKey])

  useEffect(() => {
    clearRoutes()
    clearStops()
    if (!operatorId || !lineNumber) {
      return
    }
    getRoutesAsync(dateTimeForce, operatorId, lineNumber)
      .then((lines) => setRoutes(lines))
      .finally(() => setRoutesIsLoading(false))
  }, [operatorId, lineNumber, clearRoutes, clearStops])

  const selectedRouteIds = routes?.find((route) => route.key === routeKey)?.routeIds

  useEffect(() => {
    clearStops()
    if (!routeKey || !selectedRouteIds) {
      return
    }
    setStopsIsLoading(true)
    getStopsForRouteAsync(selectedRouteIds, momentForce)
      .then((stops) => setStops(stops))
      .finally(() => setStopsIsLoading(false))
  }, [selectedRouteIds, routeKey, clearStops])

  return (
    <Container>
      <Row>
        <Label text={TEXTS.choose_datetime} />
        <DateTimePicker dateTime={dateTime} setDateTime={setDateTime} />
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
      {stopsIsLoding && (
        <Row>
          <Label text={TEXTS.loading_stops} />
          <Spin />
        </Row>
      )}
      {!stopsIsLoding && stops && (
        <StopSelector stops={stops} stopKey={stopKey} setStopKey={setStopKey} />
      )}
    </Container>
  )
}

export default LinePage

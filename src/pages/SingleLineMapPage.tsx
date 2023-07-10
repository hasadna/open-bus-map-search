import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
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
import DateTimePicker from 'src/pages/components/DateTimePicker'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import StopSelector from 'src/pages/components/StopSelector'
import { Spin } from 'antd'
import { getSiriStopHitTimesAsync } from 'src/api/siriService'
import { log } from 'src/log'
import { PageContainer } from './components/PageContainer'
import { SearchContext, TimelinePageState } from '../model/pageState'
import { NotFound } from './components/NotFound'
import moment from 'moment'

const SingleLineMapPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [state, setState] = useState<TimelinePageState>({})
  const { stopKey, stopName, stops } = state

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
      <Row>
        <Label text={TEXTS.choose_datetime} />
        <DateTimePicker
          timestamp={moment(timestamp)}
          setDateTime={(ts) => setSearch((current) => ({ ...current, timestamp: ts.valueOf() }))}
        />
      </Row>
      <Row>
        <Label text={TEXTS.choose_operator} />
        <OperatorSelector
          operatorId={operatorId}
          setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
        />
      </Row>
      <Row>
        <Label text={TEXTS.choose_line} />
        <LineNumberSelector
          lineNumber={lineNumber}
          setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
        />
      </Row>

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
    </PageContainer>
  )
}

export default SingleLineMapPage

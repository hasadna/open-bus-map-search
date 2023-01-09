import React, { useContext, useEffect, useState } from 'react'
import { PageContainer } from './components/PageContainer'
import { Row } from './components/Row'
import { Label } from './components/Label'
import { TEXTS } from '../resources/texts'
import DateTimePicker from './components/DateTimePicker'
import OperatorSelector from './components/OperatorSelector'
import LineNumberSelector from './components/LineSelector'
import { SearchContext } from '../model/pageState'
import { GapsList } from '../model/gaps'
import { getGapsAsync } from '../api/gapsService'
import { Spin } from 'antd'
import RouteSelector from './components/RouteSelector'
import { NotFound } from './components/NotFound'
import { getRoutesAsync } from '../api/gtfsService'
import { Moment } from 'moment'

function formatTime(time: Moment | undefined) {
  return time ? time.format(TEXTS.time_format) : 'MISSING'
}

const GapsPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [gaps, setGaps] = useState<GapsList>()

  const [routesIsLoading, setRoutesIsLoading] = useState(false)

  useEffect(() => {
    if (operatorId && routes && routeKey && timestamp) {
      const selectedRoute = routes.find((route) => route.key === routeKey)
      if (!selectedRoute) {
        return
      }
      getGapsAsync(timestamp, operatorId, selectedRoute.lineRef).then(setGaps)
    }
  }, [operatorId, routeKey, timestamp])

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      return
    }
    getRoutesAsync(timestamp, operatorId, lineNumber)
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .finally(() => setRoutesIsLoading(false))
  }, [operatorId, lineNumber, timestamp, setSearch])

  return (
    <PageContainer>
      <Row>
        <Label text={TEXTS.choose_datetime} />
        <DateTimePicker
          timestamp={timestamp}
          setDateTime={(ts) => setSearch((current) => ({ ...current, timestamp: ts }))}
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
      {gaps?.map((gap, i) => (
        <div key={i}>
          Siri: {formatTime(gap.siriTime)}, Gtfs: {formatTime(gap.gtfsTime)}
        </div>
      ))}
    </PageContainer>
  )
}

export default GapsPage

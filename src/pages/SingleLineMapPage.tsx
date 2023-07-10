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
import useVehicleLocations from 'src/api/useVehicleLocations'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Markers, Point, colorIcon, numberToColorHsl } from './RealtimeMapPage'

import './Map.scss'
import getAgencyList, { Agency } from 'src/api/agencyList'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

const SingleLineMapPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [state, setState] = useState<TimelinePageState>({})
  const { stopKey, stopName, stops } = state

  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const [stopsIsLoading, setStopsIsLoading] = useState(false)
  const [hitsIsLoading, setHitsIsLoading] = useState(false)

  const [agencyList, setAgencyList] = useState<Agency[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList)
  }, [])

  const clearRoutes = useCallback(() => {
    setState((current) => ({ ...current, routes: undefined, routeKey: undefined }))
  }, [setState])

  const clearStops = useCallback(() => {
    setState((current) => ({
      ...current,
      stops: undefined,
      stopKey: undefined,
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

  const locations = useVehicleLocations({
    from: selectedRouteIds ? new Date(timestamp).setHours(0, 0, 0, 0) : 0,
    to: selectedRouteIds ? new Date(timestamp).setHours(23, 59, 59, 999) : 0,
    lineRef: selectedRoute?.lineRef ?? 0,
    splitMinutes: false,
  })

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
    if (!stopName || !stops || stopKey) {
      return
    }
    const newStopKey = stops.find((stop) => stop.name === stopName)?.key
    if (newStopKey) {
      log(`setting new stopKey=${newStopKey} using the prev stopName=${stopName}`)
      setState((current) => ({ ...current, stopKey: newStopKey }))
    }
  }, [timestamp, stops])

  const positions = useMemo(() => {
    const pos = locations.map<Point>((location) => ({
      loc: [location.lat, location.lon],
      color: location.velocity,
      operator: location.siri_route__operator_ref,
      bearing: location.bearing,
      recorded_at_time: new Date(location.recorded_at_time).getTime(),
      point: location,
    }))

    return pos
  }, [locations])

  console.log({ locations, search, state, selectedRoute, positions })

  return (
    <PageContainer className="map-container">
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

      {
        //!routesIsLoading &&
        routes &&
          (routes.length === 0 ? (
            <NotFound>{TEXTS.line_not_found}</NotFound>
          ) : (
            <RouteSelector
              routes={routes}
              routeKey={routeKey}
              setRouteKey={(key) => setSearch((current) => ({ ...current, routeKey: key }))}
            />
          ))
      }
      {stopsIsLoading && (
        <Row>
          <Label text={TEXTS.loading_stops} />
          <Spin />
        </Row>
      )}
      {hitsIsLoading && (
        <Row>
          <Label text={TEXTS.loading_hits} />
          <Spin />
        </Row>
      )}
      {!hitsIsLoading && <pre>{JSON.stringify(locations, null, 2)}</pre>}

      <div className="map-info">
        <MapContainer center={position.loc} zoom={8} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />

          {positions.map((pos, i) => (
            <Marker
              position={pos.loc}
              icon={colorIcon({
                color: numberToColorHsl(pos.color, 60),
                name: agencyList.find((agency) => agency.operator_ref === pos.operator)
                  ?.agency_name,
                rotate: pos.bearing,
              })}
              key={i}>
              <Popup>
                <pre>{JSON.stringify(pos, null, 2)}</pre>
              </Popup>
            </Marker>
          ))}

          {/* {paths.map((path) => (
            <Polyline
              key={path.vehicleRef}
              pathOptions={{
                color: getColorByHashString(path.vehicleRef.toString()),
              }}
              positions={path.locations.map(({ lat, lon }) => [lat, lon])}
            />
          ))} */}
        </MapContainer>
      </div>
    </PageContainer>
  )
}

export default SingleLineMapPage

import React, { useContext, useEffect, useMemo, useState } from 'react'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { Row } from 'src/pages/components/Row'
import { INPUT_SIZE } from 'src/resources/sizes'
import { getRoutesAsync } from 'src/api/gtfsService'
import RouteSelector from 'src/pages/components/RouteSelector'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import { PageContainer } from './components/PageContainer'
import { SearchContext } from '../model/pageState'
import { NotFound } from './components/NotFound'
import moment from 'moment'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { Point, colorIcon, numberToColorHsl } from './RealtimeMapPage'

import './Map.scss'
import getAgencyList, { Agency } from 'src/api/agencyList'
import { VehicleLocation } from 'src/model/vehicleLocation'
import { getColorByHashString } from './dashboard/OperatorHbarChart/utils'
import { Spin } from 'antd'
// import getSvgFromOperatorId from './components/utils/SvgComponent/SvgComponent'
import operatorIdToSvg from './components/utils/SvgComponent/imagesMap2'
import { DataAndTimeSelector } from './components/DataAndTimeSelector'
import { Autocomplete, TextField } from '@mui/material'

interface Path {
  locations: VehicleLocation[]
  lineRef: number
  operator: number
  vehicleRef: number
}

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

const SingleLineMapPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  /* TODO: 2nd approach
  const [svgs, setSvgs] = useState(() => new Map())
  */
  const [agencyList, setAgencyList] = useState<Agency[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList)
    /* TODO: 2nd approach
    getAgencyList().then((agencyList) => {
      setAgencyList(agencyList)
      agencyList.forEach(async (agency) => {
        const icon = await getSvgFromOperatorId(agency.operator_ref)
        setSvgs(new Map(svgs.set(agency.operator_ref, icon)))
      })
    })*/
  }, [])

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      return
    }
    getRoutesAsync(moment(timestamp), operatorId, lineNumber).then((routes) =>
      setSearch((current) =>
        search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
      ),
    )
  }, [operatorId, lineNumber, timestamp])

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )
  const selectedRouteIds = selectedRoute?.routeIds

  const { locations, isLoading: locationsIsLoading } = useVehicleLocations({
    from: selectedRouteIds ? new Date(timestamp).setHours(0, 0, 0, 0) : 0,
    to: selectedRouteIds ? new Date(timestamp).setHours(23, 59, 59, 999) : 0,
    lineRef: selectedRoute?.lineRef ?? 0,
    splitMinutes: 20,
  })

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

  const [filteredPositions, setFilteredPositions] = useState<Point[]>([])

  const paths = useMemo(
    () =>
      filteredPositions.reduce((arr: Path[], loc) => {
        const line = arr.find((line) => line.vehicleRef === loc.point!.siri_ride__vehicle_ref)
        if (!line) {
          arr.push({
            locations: [loc.point!],
            lineRef: loc.point!.siri_route__line_ref,
            operator: loc.point!.siri_route__operator_ref,
            vehicleRef: loc.point!.siri_ride__vehicle_ref,
          })
        } else {
          line.locations.push(loc.point!)
        }
        return arr
      }, []),
    [filteredPositions],
  )

  return (
    <PageContainer className="map-container">
      {/* choose date */}
      <Row>
        <Label text={TEXTS.choose_datetime} />
        <DataAndTimeSelector
          timestamp={moment(timestamp)}
          setTimestamp={(ts) =>
            setSearch((current) => ({ ...current, timestamp: ts ? ts.valueOf() : 0 }))
          }
        />
      </Row>
      {/* choose operator */}
      <Row>
        <Label text={TEXTS.choose_operator} />
        <OperatorSelector
          operatorId={operatorId}
          setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
        />
      </Row>
      {/* choose line number */}
      <Row>
        <Label text={TEXTS.choose_line} />
        <LineNumberSelector
          lineNumber={lineNumber}
          setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
        />
      </Row>
      {/* choose route */}
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
      {positions && (
        <FilterPositionsByStartTime
          positions={positions}
          setFilteredPositions={setFilteredPositions}
          locationsIsLoading={locationsIsLoading}
        />
      )}

      <div className="map-info">
        <MapContainer center={position.loc} zoom={8} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />

          {filteredPositions.map((pos, i) => (
            <Marker
              position={pos.loc}
              icon={colorIcon({
                /* TODO: 2nd approach
                busIcon: svgs.get(pos.operator!) as React.FunctionComponent<
                  React.SVGAttributes<SVGElement>
                >,*/
                busIcon: operatorIdToSvg(pos.operator),
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

          {paths.map((path) => (
            <Polyline
              key={path.vehicleRef}
              pathOptions={{
                color: getColorByHashString(path.vehicleRef.toString()),
              }}
              positions={path.locations.map(({ lat, lon }) => [lat, lon])}
            />
          ))}
        </MapContainer>
      </div>
    </PageContainer>
  )
}

function FilterPositionsByStartTime({
  positions,
  setFilteredPositions,
  locationsIsLoading,
}: {
  positions: Point[]
  setFilteredPositions: (positions: Point[]) => void
  locationsIsLoading: boolean
}) {
  const [startTime, setStartTime] = useState<string>('00:00:00')
  const options = useMemo(() => {
    const options = positions
      .map((position) => position.point?.siri_ride__scheduled_start_time) // get all start times
      .filter((time, i, arr) => arr.indexOf(time) === i) // unique
      .map((time) => new Date(time ?? 0).toLocaleTimeString()) // convert to strings
      .map((time) => ({
        // convert to options
        value: time,
        label: time,
      }))
    return options
  }, [positions])

  useEffect(() => {
    setFilteredPositions(
      positions.filter(
        (position) =>
          new Date(position.point?.siri_ride__scheduled_start_time ?? 0).toLocaleTimeString() ===
          startTime,
      ),
    )
  }, [startTime])

  return (
    <Row>
      <Label text={TEXTS.choose_start_time} />
      {locationsIsLoading && <Spin size="small" />}
      <FilterPositionsByStartTimeSelector
        options={options}
        startTime={startTime}
        setStartTime={setStartTime}
      />
    </Row>
  )
}

type FilterPositionsByStartTimeSelectorProps = {
  options: {
    value: string
    label: string
  }[]
  startTime?: string
  setStartTime: (time: string) => void
}

function FilterPositionsByStartTimeSelector({
  options,
  startTime,
  setStartTime,
}: FilterPositionsByStartTimeSelectorProps) {
  const valueFinned = options.find((option) => option.value === startTime)
  const value = valueFinned ? valueFinned : null

  return (
    <Autocomplete
      disablePortal
      value={value}
      onChange={(e, value) => setStartTime(value ? value.value : '0')}
      id="operator-select"
      sx={{ width: INPUT_SIZE }}
      options={options}
      renderInput={(params) => <TextField {...params} label={TEXTS.choose_start_time} />}
      getOptionLabel={(option) => option.label}
    />
  )
}

export default SingleLineMapPage

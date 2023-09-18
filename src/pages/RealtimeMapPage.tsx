import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { TEXTS } from 'src/resources/texts'

import { Button } from '@mui/material'
import { Spin } from 'antd'
import { DivIcon } from 'leaflet'
import moment from 'moment'
import getAgencyList, { Agency } from 'src/api/agencyList'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { VehicleLocation } from 'src/model/vehicleLocation'
import './Map.scss'
import { DataAndTimeSelector } from './components/DataAndTimeSelector'
import MinuteSelector from './components/MinuteSelector'
import operatorIdToSvg from './components/utils/SvgComponent/BusLogosLoader'
import { getColorByHashString } from './dashboard/OperatorHbarChart/utils'

export interface Point {
  loc: [number, number]
  color: number
  operator?: number
  bearing?: number
  point?: VehicleLocation
  recorded_at_time?: number
}

interface Path {
  locations: VehicleLocation[]
  lineRef: number
  operator: number
  vehicleRef: number
}

export const colorIcon = ({
  busIcon,
  name,
}: {
  busIcon: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  name?: string
}) => {
  return new DivIcon({
    className: 'my-div-icon',
    html: `
    <div class="bus-icon-container">
      <img src=${busIcon} class="mask">
      </img>
      <div style="width: max-content">${name}</div>
    </div>
    `,
  })
}

function formatTime(time: string | number | Date) {
  const date = new Date(time).toISOString()
  return date
}

export function numberToColorHsl(i: number, max: number) {
  const ratio = i / max
  // 0 - black. 1 - red
  const hue = 0
  const saturation = ratio * 100
  const lightness = ratio * 50
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export default function RealtimeMapPage() {
  const position: Point = {
    loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
    color: 0,
  }
  const [from, setFrom] = useState('2023-05-01T12:00:00+02:00') // arbitrary default value. this date is not important
  const [to, setTo] = useState('2023-05-01T12:01:00+02:00')

  const { locations, isLoading } = useVehicleLocations({
    from: formatTime(from),
    to: formatTime(to),
  })
  console.log(locations)

  const loaded = locations.length

  const positions = useMemo(() => {
    const pos = locations.map<Point>((location) => ({
      loc: [location.lat, location.lon],
      color: location.velocity,
      operator: location.siri_route__operator_ref,
      bearing: location.bearing,
      recorded_at_time: new Date(location.recorded_at_time).getTime(),
      point: location,
    }))

    // keep only the latest point for each vehicle
    // pos = pos.filter((p) =>
    //   pos.every(
    //     (p2) =>
    //       p2.point!.siri_ride__vehicle_ref !== p.point!.siri_ride__vehicle_ref ||
    //       p2.recorded_at_time! <= p.recorded_at_time!,
    //   ),
    // )
    return pos
  }, [locations])

  const paths = useMemo(
    () =>
      locations.reduce((arr: Path[], loc) => {
        const line = arr.find((line) => line.vehicleRef === loc.siri_ride__vehicle_ref)
        if (!line) {
          arr.push({
            locations: [loc],
            lineRef: loc.siri_route__line_ref,
            operator: loc.siri_route__operator_ref,
            vehicleRef: loc.siri_ride__vehicle_ref,
          })
        } else {
          line.locations.push(loc)
        }
        return arr
      }, []),
    [locations],
  )

  console.log(paths)

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>Realtime Map</h1>
        <div className="map-header-buttons">
          <label>
            {TEXTS.from_date}{' '}
            <DataAndTimeSelector
              timestamp={moment(from.slice(0, 16))} // remove timezone and seconds
              setTimestamp={(ts) => {
                const value = ts ? ts.format() : ''
                setFrom(value)
                setTo(formatTime(+new Date(value) + (+new Date(to) - +new Date(from)))) // keep the same time difference
              }}
              showTimePicker={true}
            />
          </label>{' '}
        </div>
        <div className="map-header-buttons">
          <label>
            {TEXTS.watch_locations_in_range}{' '}
            <MinuteSelector
              num={(+new Date(to) - +new Date(from)) / 1000 / 60}
              setNum={(num) => setTo(formatTime(+new Date(from) + +num * 1000 * 60))}
            />{' '}
            {TEXTS.minutes}
          </label>
        </div>
        <div className="map-header-buttons">
          <Button
            variant="contained"
            onClick={() => {
              setFrom(formatTime(+new Date() - 5 * 1000 * 60)) // 5 minutes ago
              setTo(formatTime(+new Date() - 4 * 1000 * 60)) // 4 minutes ago
            }}>
            לפני 5 דקות
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setFrom(formatTime(+new Date() - 10 * 1000 * 60)) // 10 minutes ago
              setTo(formatTime(+new Date() - 9 * 1000 * 60)) // 9 minutes ago
            }}>
            לפני 10 דקות
          </Button>
        </div>
        <div className="map-header-buttons">
          <p>
            {loaded} {`- `}
            {TEXTS.show_x_bus_locations} {` `}
            {TEXTS.from_time_x_to_time_y
              .replace('XXX', new Date(from).toLocaleTimeString())
              .replace('YYY', new Date(to).toLocaleTimeString())}
          </p>
        </div>
        {isLoading && <Spin size="small" />}
      </div>
      <div className="map-info">
        <MapContainer center={position.loc} zoom={8} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <Markers positions={positions} />
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
    </div>
  )
}

export function Markers({ positions }: { positions: Point[] }) {
  const map = useMap()
  const [agencyList, setAgencyList] = useState<Agency[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList).catch(console.log)
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      map.flyTo([position.coords.latitude, position.coords.longitude], 13),
    )
  }, [])

  return (
    <>
      <MarkerClusterGroup chunkedLoading>
        {positions.map((pos, i) => (
          <Marker
            position={pos.loc}
            icon={colorIcon({
              busIcon: operatorIdToSvg(pos.operator),
              name: agencyList.find((agency) => agency.operator_ref === pos.operator)?.agency_name,
            })}
            key={i}>
            <Popup>
              <pre>{JSON.stringify(pos, null, 2)}</pre>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </>
  )
}

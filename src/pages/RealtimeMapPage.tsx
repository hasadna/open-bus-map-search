import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, useMap, Marker, Popup, TileLayer } from 'react-leaflet'
// import https://www.svgrepo.com/show/113626/bus-front.svg
import busIcon from '../resources/bus-front.svg'
import MarkerClusterGroup from 'react-leaflet-cluster'

import './Map.scss'
import { DivIcon } from 'leaflet'
import agencyList from 'open-bus-stride-client/agencies/agencyList'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { VehicleLocation } from 'src/model/vehicleLocation'

interface Point {
  loc: [number, number]
  color: number
  operator?: string
  bearing?: number
  point?: VehicleLocation
  recorded_at_time?: number
}

interface ColorMemo {
  [key: string]: DivIcon
}

const colormemo: ColorMemo = {}

const colorIcon = ({
  color,
  name,
  rotate = 0,
}: {
  color: string
  name?: string
  rotate?: number
}) => {
  if (colormemo[color]) return colormemo[color]
  return (colormemo[color] = new DivIcon({
    className: 'my-div-icon',
    html: `<div class="mask" style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        mask-image: url(${busIcon});
        -webkit-mask-image: url(${busIcon});
        transform: rotate(${rotate}deg);
    ">
        <div
            style="
                background-color: ${color};
                width: 100%;
                height: 100%;
            "
        ></div>
    </div>
    <div class="text">${name}</div>
    `,
  }))
}

function formatTime(time: any) {
  const date = new Date(time).toISOString()
  return date
}

function numberToColorHsl(i: number, max: number) {
  const ratio = i / max
  // 0 - black. 1 - red
  const hue = 0
  const saturation = ratio * 100
  const lightness = ratio * 50
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export default function RealtimeMapPage() {
  const position: Point = {
    loc: [32.3057988, 34.85478613],
    color: 0,
  }
  const [from, setFrom] = useState('2023-05-01T12:00:00+02:00')
  const [to, setTo] = useState('2023-05-01T12:01:00+02:00')

  const locations = useVehicleLocations({
    from: formatTime(from),
    to: formatTime(to),
  })

  const loaded = locations.length

  const minTime = new Date(from).getTime()
  const maxTime = new Date(to).getTime()
  const [chosenTime, setChosenTime] = useState((minTime + maxTime) / 2)

  const positions = useMemo(() => {
    let pos = locations.map<Point>((location) => ({
      loc: [location.lat, location.lon],
      color: location.velocity,
      operator: String(location.siri_route__operator_ref),
      bearing: location.bearing,
      recorded_at_time: new Date(location.recorded_at_time).getTime(),
      point: location,
    }))
    // keep only the latest point for each vehicle
    pos = pos.filter((p) =>
      pos.every(
        (p2) =>
          p2.point!.siri_ride__vehicle_ref !== p.point!.siri_ride__vehicle_ref ||
          p2.recorded_at_time! <= p.recorded_at_time!,
      ),
    )
    return pos
  }, [locations])

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>Realtime Map</h1>
        {/* <div className="map-header-buttons">
          <input
            type="range"
            min={minTime}
            max={maxTime}
            value={chosenTime}
            onChange={(e) => setChosenTime(Number(e.target.value))}
          />
          <button onClick={() => setChosenTime(minTime)}>Start</button>
          <button onClick={() => setChosenTime(maxTime)}>End</button>
        </div> */}
        <div className="map-header-buttons">
          <label>
            מתאריך
            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>{' '}
          {` `}
          <label>
            עד תאריך
            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        <p>Loaded {loaded} busses</p>
      </div>
      <div className="map-info">
        <MapContainer center={position.loc} zoom={8} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <Markers positions={positions} />
        </MapContainer>
      </div>
    </div>
  )
}

function Markers({ positions }: { positions: Point[] }) {
  const map = useMap()

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
              color: numberToColorHsl(pos.color, 60),
              name: agencyList.find((agency) => agency.agency_id === String(pos.operator))
                ?.agency_name,
              rotate: pos.bearing,
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

import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, useMap, Marker, Popup, TileLayer } from 'react-leaflet'
// import https://www.svgrepo.com/show/113626/bus-front.svg
import busIcon from '../resources/bus-front.svg'
import MarkerClusterGroup from 'react-leaflet-cluster'

import './Map.scss'
import { DivIcon } from 'leaflet'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { VehicleLocation } from 'src/model/vehicleLocation'
import getAgencyList, { Agency } from 'src/api/agencyList'

interface Point {
  loc: [number, number]
  color: number
  operator?: number
  bearing?: number
  point?: VehicleLocation
  recorded_at_time?: number
}

const colorIcon = ({
  color,
  name,
  rotate = 0,
}: {
  color: string
  name?: string
  rotate?: number
}) => {
  return new DivIcon({
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
  })
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

  const positions = useMemo(() => {
    let pos = locations.map<Point>((location) => ({
      loc: [location.lat, location.lon],
      color: location.velocity,
      operator: location.siri_route__operator_ref,
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
        <div className="map-header-buttons">
          <label>
            מתאריך
            <input
              type="datetime-local"
              value={from.slice(0, 16)}
              onChange={(e) => {
                setFrom(e.target.value)
                setTo(formatTime(+new Date(e.target.value) + (+new Date(to) - +new Date(from))))
              }}
            />
          </label>{' '}
          {` `}
          <label>
            צפה במיקומי אוטובוסים בטווח של
            <input
              type="number"
              value={(+new Date(to) - +new Date(from)) / 1000 / 60}
              onChange={(e) => setTo(formatTime(+new Date(from) + +e.target.value * 1000 * 60))}
            />
            דקות
          </label>
        </div>
        <div className="map-header-buttons">
          <button
            onClick={() => {
              setFrom(formatTime(+new Date() - 5 * 1000 * 60))
              setTo(formatTime(+new Date() - 4 * 1000 * 60))
            }}>
            לפני 5 דקות
          </button>
          <button
            onClick={() => {
              setFrom(formatTime(+new Date() - 10 * 1000 * 60))
              setTo(formatTime(+new Date() - 9 * 1000 * 60))
            }}>
            לפני 10 דקות
          </button>
        </div>
        <p>
          מציג {loaded} מיקומי אוטובוסים בין השעות {new Date(from).toLocaleTimeString()} ל{' '}
          {new Date(to).toLocaleTimeString()}
        </p>
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
  const [agencyList, setAgencyList] = useState<Agency[]>([])

  useEffect(() => {
    getAgencyList().then(setAgencyList)
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
              color: numberToColorHsl(pos.color, 60),
              name: agencyList.find((agency) => agency.operator_ref === pos.operator)?.agency_name,
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

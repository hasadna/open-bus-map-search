import React, { useEffect, useState } from 'react'
import { MapContainer, useMap, Marker, Popup, TileLayer } from 'react-leaflet'
// import https://www.svgrepo.com/show/113626/bus-front.svg
import busIcon from '../resources/bus-front.svg'
import MarkerClusterGroup from 'react-leaflet-cluster'

import './Map.scss'
import { DivIcon } from 'leaflet'
import agencyList from 'open-bus-stride-client/agencies/agencyList'

interface Point {
  loc: [number, number]
  color: number
  operator?: string
  bearing?: number
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

function numberToColorHsl(i: number, max: number) {
  const ratio = i / max
  // 0 - black. 1 - red
  const hue = 0
  const saturation = ratio * 100
  const lightness = ratio * 50
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

function formatTime(time: string) {
  const date = new Date(time).toISOString()
  return date
}

export default function RealtimeMapPage() {
  const position: Point = {
    loc: [32.3057988, 34.85478613],
    color: 0,
  }

  const [positions, setPositions] = useState<Point[]>([])
  const [limit, setLimit] = useState(20)
  const [loaded, setLoaded] = useState(0)
  const [from, setFrom] = useState('2023-05-01T12:00:00+02:00')
  const [to, setTo] = useState('2023-05-01T12:01:00+02:00')

  useEffect(() => {
    ;(async () => {
      const url = `https://open-bus-stride-api.hasadna.org.il/siri_vehicle_locations/list?get_count=false&recorded_at_time_from=${
        formatTime(from) || '2023-05-01T12:00:00+02:00'
      }&recorded_at_time_to=${
        formatTime(to) || '2023-05-01T12:01:00+02:00'
      }&order_by=id%20asc&limit=${limit}`
      const response = await fetch(url)
      const data = await response.json()
      const points: Point[] = data.map(
        (point: {
          lat: number
          lon: number
          velocity: number
          siri_route__operator_ref: string
          bearing: number
        }) => ({
          loc: [point.lat, point.lon],
          color: point.velocity,
          point,
          operator: point.siri_route__operator_ref,
          bearing: point.bearing,
        }),
      )
      setPositions(points)
      setLoaded(points.length)
    })()
  }, [limit])

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>Realtime Map</h1>
        <div className="map-header-buttons">
          <button onClick={() => setLimit(500)}>500</button>
          <button onClick={() => setLimit(1000)}>1000</button>
          <button onClick={() => setLimit(5000)}>5000</button>
          <button onClick={() => setLimit(10000)}>10000</button>
          <button onClick={() => setLimit(10000)}>30000</button>
        </div>
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
        <p>
          Loaded {loaded} out of {limit} points
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
  const [filteredList, setFilteredList] = useState<Point[]>([])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      map.flyTo([position.coords.latitude, position.coords.longitude], 13),
    )
    map.on('moveend', updateFilteredList)
    map.on('zoomend', updateFilteredList)

    return () => {
      map.off('moveend', updateFilteredList)
      map.off('zoomend', updateFilteredList)
    }
  }, [])

  function updateFilteredList() {
    const bounds = map.getBounds()
    const filtered = positions.filter((pos) => bounds.pad(1).contains(pos.loc))
    setFilteredList(filtered)
  }

  const bounds = map.getBounds().pad(1)
  positions = positions.filter((pos) => bounds.contains(pos.loc))
  return (
    <>
      <MarkerClusterGroup chunkedLoading>
        {filteredList.map((pos, i) => (
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

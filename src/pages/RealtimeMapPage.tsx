import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
// import https://www.svgrepo.com/show/113626/bus-front.svg
import busIcon from '../resources/bus-front.svg'

import './Map.scss'
import { DivIcon, Icon } from 'leaflet'

interface Point {
  loc: [number, number]
  color: number
}

const LeafIcon = new Icon({
  iconUrl: 'https://www.svgrepo.com/show/113626/bus-front.svg',
  // circle icon:
  //   iconUrl:
  // 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="red" /></svg>',
  iconSize: [30, 30], //[30, 30],
  //   shadowSize: [50, 64],
  //   iconAnchor: [22, 94],
  //   shadowAnchor: [4, 62],
  //   popupAnchor: [-3, -76],
})

interface ColorMemo {
  [key: string]: DivIcon
}

const colormemo: ColorMemo = {}

const colorIcon = (color: string) => {
  if (colormemo[color]) return colormemo[color]
  return (colormemo[color] = new DivIcon({
    className: 'my-div-icon',
    html: `<div class="mask" style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        mask-image: url(${busIcon});
        -webkit-mask-image: url(${busIcon});
    ">
        <div
            style="
                background-color: ${color};
                width: 100%;
                height: 100%;
            "
        ></div>
    </div>`,
  }))
}

function numberToColorHsl(i: number, max: number) {
  const ratio = i / max
  return 'hsl(' + ratio * 360 + ', 100%, 50%)'
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
  const [limit, setLimit] = useState(500)
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
      const points: Point[] = data.map((point: { lat: number; lon: number; velocity: number }) => ({
        loc: [point.lat, point.lon],
        color: point.velocity,
        point,
      }))
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
          {positions.map((pos, i) => (
            <Marker position={pos.loc} icon={colorIcon(numberToColorHsl(pos.color, 120))} key={i}>
              <Popup>
                <pre>{JSON.stringify(pos, null, 2)}</pre>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

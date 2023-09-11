import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, useMap, Marker, Popup, TileLayer, Polyline } from 'react-leaflet'
// import https://www.svgrepo.com/show/113626/bus-front.svg
import defaultIcon from '../resources/bus-front.svg'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { TEXTS } from 'src/resources/texts'

import './Map.scss'
import { DivIcon } from 'leaflet'
import useVehicleLocations from 'src/api/useVehicleLocations'
import { VehicleLocation } from 'src/model/vehicleLocation'
import getAgencyList, { Agency } from 'src/api/agencyList'
import { getColorByHashString } from './dashboard/OperatorHbarChart/utils'
import { Spin } from 'antd'
// import getSvgFromOperatorId from './components/utils/SvgComponent/SvgComponent'
import svgsMap from './components/utils/SvgComponent/imagesMap'
import operatorIdToSvg from './components/utils/SvgComponent/imagesMap'

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
  color,
  name,
  rotate = 0,
}: {
  busIcon: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  color: string
  name?: string
  rotate?: number
}) => {
  /* TODO: 2nd approach
  const icon = (busIcon as any)?.default ?? defaultIcon
  */
  return new DivIcon({
    className: 'my-div-icon',
    html: `
        <img src=${busIcon} class="mask" style="
        width: 50px;
        height: 50px;
        background-repeat: no-repeat;">
    </img>
    <div style="width: max-content;">${name}</div>
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
            {TEXTS.from_date}
            <input
              type="datetime-local"
              value={from.slice(0, 16)} // remove timezone and seconds
              onChange={(e) => {
                setFrom(e.target.value)
                setTo(formatTime(+new Date(e.target.value) + (+new Date(to) - +new Date(from)))) // keep the same time difference
              }}
            />
          </label>{' '}
          {` `}
          <label>
            {TEXTS.watch_locations_in_range}
            <input
              type="number"
              value={(+new Date(to) - +new Date(from)) / 1000 / 60} // minutes difference between from and to
              onChange={(e) => setTo(formatTime(+new Date(from) + +e.target.value * 1000 * 60))}
            />
            {TEXTS.minutes}
          </label>
        </div>
        <div className="map-header-buttons">
          <button
            onClick={() => {
              setFrom(formatTime(+new Date() - 5 * 1000 * 60)) // 5 minutes ago
              setTo(formatTime(+new Date() - 4 * 1000 * 60)) // 4 minutes ago
            }}>
            לפני 5 דקות
          </button>
          <button
            onClick={() => {
              setFrom(formatTime(+new Date() - 10 * 1000 * 60)) // 10 minutes ago
              setTo(formatTime(+new Date() - 9 * 1000 * 60)) // 9 minutes ago
            }}>
            לפני 10 דקות
          </button>
        </div>
        <p>
          {loaded} {isLoading && <Spin size="small" />} {` `}
          {/*FIXME Spin not be inside p. it generate Warning: validateDOMNesting(...). need find another place in the page.*/}
          {TEXTS.show_x_bus_locations} {` `}
          {TEXTS.from_time_x_to_time_y
            .replace('XXX', new Date(from).toLocaleTimeString())
            .replace('YYY', new Date(to).toLocaleTimeString())}
        </p>
      </div>
      <div className="map-info">
        <MapContainer center={position.loc} zoom={8} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
  /*
  TODO: 2nd approach
  const [svgs, setSvgs] = useState(() => new Map())
  */

  useEffect(() => {
    getAgencyList().then(setAgencyList)
    /*TODO: 2nd approach
    getAgencyList().then((agencyList) => {
      setAgencyList(agencyList)
      agencyList.forEach(async (agency) => {
        const icon = await getSvgFromOperatorId(agency.operator_ref)
        setSvgs(new Map(svgs.set(agency.operator_ref, icon)))
      })
    })*/
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
              /*TODO: 2nd approach
              busIcon: svgs.get(pos.operator!) as React.FunctionComponent<
                React.SVGAttributes<SVGElement>
              >,*/
              busIcon: operatorIdToSvg(pos.operator),
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

import { DivIcon } from 'leaflet'
import React, { useEffect, useState } from 'react'
import getAgencyList, { Agency } from 'src/api/agencyList'
import busIcon from '../resources/bus-front.svg'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useMap, Marker, Popup } from 'react-leaflet'
import { VehicleLocation } from 'src/model/vehicleLocation'

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

function numberToColorHsl(i: number, max: number) {
  const ratio = i / max
  // 0 - black. 1 - red
  const hue = 0
  const saturation = ratio * 100
  const lightness = ratio * 50
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export interface VehicleLocationMapPoint {
  loc: [number, number]
  color: number
  operator?: number
  bearing?: number
  point?: VehicleLocation
  recorded_at_time?: number
}

export function BusLayer({ positions }: { positions: VehicleLocationMapPoint[] }) {
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

import { DivIcon } from 'leaflet'
import React, { useEffect, useState } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import getAgencyList, { Agency } from 'src/api/agencyList'
import { VehicleLocation } from 'src/model/vehicleLocation'

const colorIcon = ({ operator_id, name }: { operator_id: string; name?: string }) => {
  const path = process.env.PUBLIC_URL + `/bus-logos/${operator_id}.svg`
  return new DivIcon({
    className: 'my-div-icon',
    html: `
    <div class="bus-icon-container">
      <div class="bus-icon-circle">
        <img src="${path}" alt="${name}" />
      </div>
      <div class="operator-name">${name}</div>
    </div>
    `,
  })
}

/*function numberToColorHsl(i: number, max: number) {
  const ratio = i / max
  // 0 - black. 1 - red
  const hue = 0
  const saturation = ratio * 100
  const lightness = ratio * 50
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}*/

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
              operator_id: pos.operator?.toString() || 'default',
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

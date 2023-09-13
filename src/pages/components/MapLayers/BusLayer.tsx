import { DivIcon } from 'leaflet'
import React, { useEffect, useState } from 'react'
import getAgencyList, { Agency } from 'src/api/agencyList'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useMap, Marker, Popup } from 'react-leaflet'
import { VehicleLocation } from 'src/model/vehicleLocation'
// import getSvgFromOperatorId from '../utils/SvgComponent/SvgComponent'
import operatorIdToSvg from '../utils/SvgComponent/imagesMap2'

const colorIcon = ({
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
  /*
  TODO: 2nd approach
  const icon = (busIcon as any)?.default ?? defaultIcon
  */

  /*return new DivIcon({
    className: 'my-div-icon',
    html: `<div class="mask" style="
          width: 50px;
          height: 50px;
          background-repeat: no-repeat;
          background-image: url(${busIcon});
      ">
      </div>
      <div>${name}</div>`,
  })*/
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
  /* TODO: 2nd approach
  const [svgs, setSvgs] = useState(() => new Map())
  */

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
              /* TODO: 2nd approach
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

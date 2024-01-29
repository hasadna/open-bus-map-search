import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { Icon, IconOptions } from 'leaflet'
import { useAgencyList } from 'src/api/agencyList'
import { Point } from 'src/pages/realtimeMap'
import { busIcon, busIconPath } from '../utils/BusIcon'
import { BusToolTip } from './MapLayers/BusToolTip'
import { VehicleLocation } from 'src/model/vehicleLocation'
import { useCallback, useState } from 'react'
import { Button } from 'antd'
import { ExpandAltOutlined } from '@ant-design/icons'
import '../../Map.scss'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}
export interface Path {
  locations: VehicleLocation[]
  lineRef: number
  operator: number
  vehicleRef: number
}

export function MapWithLocationsAndPath({ positions }: { positions: Point[] }) {
  const agencyList = useAgencyList()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])
  console.log('MapWithLocationsAndPath', `${isExpanded ? 'expanded' : 'collapsed'}`)

  const wayPointMarker = new Icon<IconOptions>({
    iconUrl: '/marker-dot.png',
    iconSize: [10, 10],
  })

  return (
    <div className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <Button
        type="primary"
        className="expand-button"
        shape="circle"
        onClick={toggleExpanded}
        icon={<ExpandAltOutlined />}
      />
      <MapContainer center={position.loc} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {positions.map((pos, i) => {
          const icon =
            i === 0
              ? busIcon({
                  operator_id: pos.operator?.toString() || 'default',
                  name: agencyList.find((agency) => agency.operator_ref === pos.operator)
                    ?.agency_name,
                })
              : wayPointMarker
          return (
            <Marker position={pos.loc} icon={icon} key={i}>
              <Popup minWidth={300} maxWidth={700}>
                <BusToolTip position={pos} icon={busIconPath(pos.operator!)} />
              </Popup>
            </Marker>
          )
        })}

        {positions.length && (
          <Polyline
            pathOptions={{ color: 'black' }}
            positions={positions.map((position) => position.loc)}
          />
        )}
      </MapContainer>
    </div>
  )
}

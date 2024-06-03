import { MapContainer } from 'react-leaflet'
import { useCallback, useState } from 'react'
import { Button } from 'antd'
import { ExpandAltOutlined } from '@ant-design/icons'
import { MapProps } from './map-types'
import '../../Map.scss'
import { MapContent } from './MapContent'
import { Point } from 'src/pages/timeBasedMap'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

export function MapWithLocationsAndPath({ positions, plannedRouteStops }: MapProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

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
        <MapContent positions={positions} plannedRouteStops={plannedRouteStops} />
      </MapContainer>
    </div>
  )
}

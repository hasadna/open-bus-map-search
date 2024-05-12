import { MapContainer } from 'react-leaflet'
import { Point } from 'src/pages/timeBasedMap'
import { MapContent } from './MapContent'

import { VehicleLocation } from 'src/model/vehicleLocation'
import { useCallback, useState } from 'react'
import { Button } from 'antd'
import { ExpandAltOutlined } from '@ant-design/icons'
import { BusStop } from 'src/model/busStop'
import '../../Map.scss'

export const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

export interface Path {
  locations: VehicleLocation[]
  lineRef: number
  operator: number
  vehicleRef: number
}

export interface MapProps {
  positions: Point[]
  plannedRouteStops: BusStop[]
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

// export function RecenterOnDataChange({ positions, plannedRouteStops }: MapProps) {
//   const map = useMap()

//   useEffect(() => {
//     const positionsSum = positions.reduce(
//       (acc, { loc }) => [acc[0] + loc[0], acc[1] + loc[1]],
//       [0, 0],
//     )
//     const mean: LatLngTuple = [
//       positionsSum[0] / positions.length || position.loc[0],
//       positionsSum[1] / positions.length || position.loc[1],
//     ]

//     map.setView(mean, map.getZoom(), { animate: true })
//   }, [positions, plannedRouteStops])

//   return null
// }

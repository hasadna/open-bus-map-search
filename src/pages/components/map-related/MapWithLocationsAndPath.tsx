import { useMap } from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import { Point } from 'src/pages/timeBasedMap'
import { MapContent } from './MapContent'
import { VehicleLocation } from 'src/model/vehicleLocation'
import { useCallback, useEffect, useState } from 'react'
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
      <MapContent positions={positions} plannedRouteStops={plannedRouteStops} />
    </div>
  )
}

export function MapIndex({
  lineColor,
  imgSrc,
  title,
}: {
  lineColor: string
  imgSrc: string
  title: string
}) {
  return (
    <div className="map-index-item">
      <div className="map-index-item-config">
        <p className="map-index-item-line" style={{ backgroundColor: lineColor }}></p>
        <p className="map-index-item-icon" style={{ backgroundImage: `url(${imgSrc})` }}>
          {/* <img src={imgSrc} alt="planned route stop icon" /> */}
        </p>
      </div>
      <div className="map-index-item-title">
        <h3>{title}</h3>
      </div>
    </div>
  )
}

export function RecenterOnDataChange({ positions, plannedRouteStops }: MapProps) {
  const map = useMap()

  useEffect(() => {
    const positionsSum = positions.reduce(
      (acc, { loc }) => [acc[0] + loc[0], acc[1] + loc[1]],
      [0, 0],
    )
    const mean: LatLngTuple = [
      positionsSum[0] / positions.length || position.loc[0],
      positionsSum[1] / positions.length || position.loc[1],
    ]

    map.setView(mean, map.getZoom(), { animate: true })
  }, [positions, plannedRouteStops])

  return null
}

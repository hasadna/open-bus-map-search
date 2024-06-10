import { MapContainer } from 'react-leaflet'
import { Point } from 'src/pages/timeBasedMap'
import IconButton from '@mui/material/IconButton'
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded'
import { MapProps } from './map-types'
import { useCallback, useState } from 'react'
import '../../Map.scss'
import { MapContent } from './MapContent'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

export function MapWithLocationsAndPath({ positions, plannedRouteStops }: MapProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  return (
    <div className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <IconButton color="primary" className="expand-button" onClick={toggleExpanded}>
        <OpenInFullRoundedIcon fontSize="large" />
      </IconButton>

      <MapContainer center={position.loc} zoom={13} scrollWheelZoom={true}>
        <MapContent positions={positions} plannedRouteStops={plannedRouteStops} />
      </MapContainer>
    </div>
  )
}

import { OpenInFullRounded } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useCallback, useRef, useState } from 'react'
import { MapContainer } from 'react-leaflet'
import { useConstrainedFloatingButton } from 'src/hooks/useConstrainedFloatingButton'
import { Point } from 'src/pages/timeBasedMap'
import { MapProps } from './map-types'
import { MapContent } from './MapContent'
import '../../Map.scss'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

export function MapWithLocationsAndPath({
  positions,
  plannedRouteStops,
  showNavigationButtons,
}: MapProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useConstrainedFloatingButton(mapContainerRef, buttonRef, isExpanded)

  return (
    <div ref={mapContainerRef} className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <IconButton
        ref={buttonRef}
        color="primary"
        className="expand-button"
        onClick={toggleExpanded}>
        <OpenInFullRounded fontSize="large" />
      </IconButton>

      <MapContainer center={position.loc} zoom={13} scrollWheelZoom={true}>
        <MapContent
          positions={positions}
          plannedRouteStops={plannedRouteStops}
          showNavigationButtons={showNavigationButtons}
        />
      </MapContainer>
    </div>
  )
}

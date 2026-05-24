import { OpenInFullRounded } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useCallback, useRef, useState } from 'react'
import { MapContainer, useMapEvents } from 'react-leaflet'
import { useConstrainedFloatingButton } from 'src/hooks/useConstrainedFloatingButton'
import { MapProps } from './map-types'
import { MapContent } from './MapContent'

const DEFAULT_CENTER: [number, number] = [32.3057988, 34.85478613] // Netanya
const DEFAULT_ZOOM = 13

type MapWithLocationsAndPathProps = MapProps & {
  isExpanded?: boolean
  onToggleExpanded?: () => void
  /** Saved viewport — restores the user's last pan/zoom when returning to the page. */
  centerLat?: number
  centerLng?: number
  zoom?: number
  onViewportChange?: (centerLat: number, centerLng: number, zoom: number) => void
  /** Passed to useRecenterOnDataChange — auto-fit only fires when this changes. */
  routeIdentity?: string
}

export function MapWithLocationsAndPath({
  positions,
  plannedRouteStops,
  showNavigationButtons,
  isExpanded: isExpandedProp,
  onToggleExpanded,
  centerLat,
  centerLng,
  zoom,
  onViewportChange,
  routeIdentity,
}: MapWithLocationsAndPathProps) {
  const [isExpandedLocal, setIsExpandedLocal] = useState<boolean>(false)
  const isExpanded = isExpandedProp ?? isExpandedLocal
  const toggleExpanded = useCallback(
    () => (onToggleExpanded ? onToggleExpanded() : setIsExpandedLocal((v) => !v)),
    [onToggleExpanded],
  )

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useConstrainedFloatingButton(mapContainerRef, buttonRef, isExpanded)

  const center: [number, number] =
    centerLat !== undefined && centerLng !== undefined ? [centerLat, centerLng] : DEFAULT_CENTER

  return (
    <div ref={mapContainerRef} className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <IconButton
        ref={buttonRef}
        color="primary"
        className="expand-button"
        onClick={toggleExpanded}>
        <OpenInFullRounded fontSize="large" />
      </IconButton>

      <MapContainer center={center} zoom={zoom ?? DEFAULT_ZOOM} scrollWheelZoom={true}>
        <MapContent
          positions={positions}
          plannedRouteStops={plannedRouteStops}
          showNavigationButtons={showNavigationButtons}
          routeIdentity={routeIdentity}
        />
        {onViewportChange && <MapViewportTracker onViewportChange={onViewportChange} />}
      </MapContainer>
    </div>
  )
}

function MapViewportTracker({
  onViewportChange,
}: {
  onViewportChange: (lat: number, lng: number, zoom: number) => void
}) {
  useMapEvents({
    moveend(e) {
      const map = e.target as {
        getCenter: () => { lat: number; lng: number }
        getZoom: () => number
      }
      const c = map.getCenter()
      onViewportChange(c.lat, c.lng, map.getZoom())
    },
  })
  return null
}

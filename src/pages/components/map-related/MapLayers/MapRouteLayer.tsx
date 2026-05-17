import { useCallback, useMemo, useRef } from 'react'
import { Marker, Polyline, Popup, useMap } from 'react-leaflet'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { busIcon, busIconPath } from '../../utils/BusIcon'
import type { Point } from '../map-types'
import { actualRouteLineColor, actualRouteStopMarker } from '../MapContent'
import MapFooterButtons from '../MapFooterButtons/MapFooterButtons'
import { BusToolTip } from './BusToolTip'

type PopupLayerRef = {
  openPopup: () => void
}

interface MapRouteLayerProps {
  positions: Point[]
  showNavigationButtons?: boolean
}

export function MapRouteLayer({ positions, showNavigationButtons }: MapRouteLayerProps) {
  const markerRef = useRef<{ [key: number]: PopupLayerRef | null }>({})
  const agencyList = useAgencyList()
  const map = useMap()

  const markerIdsByPositionId = useMemo(() => {
    const markerIds = positions.map((_, index) => index)
    return new Map(markerIds.map((markerId) => [markerId, markerIds]))
  }, [positions])

  const navigateMarkers = useCallback(
    (positionId: number) => {
      const pos = positions[positionId]
      if (!map || !pos?.loc) return
      const marker = markerRef.current[positionId]
      if (marker) {
        map.flyTo(pos.loc, map.getZoom())
        marker.openPopup()
      }
    },
    [map, positions],
  )

  return (
    <>
      {positions.map((pos, i) => {
        const icon =
          i === 0
            ? busIcon({
                operator_id: pos.operator?.toString() || 'default',
                name: agencyList.find((agency) => agency.operatorRef === pos.operator)?.agencyName,
              })
            : actualRouteStopMarker
        return (
          <Marker
            ref={(ref) => {
              markerRef.current[i] = ref
            }}
            position={pos.loc}
            icon={icon}
            key={i}>
            <Popup minWidth={300} maxWidth={700}>
              <BusToolTip position={pos} icon={busIconPath(pos.operator!)}>
                {showNavigationButtons && (
                  <MapFooterButtons
                    currentMarkerId={i}
                    markerIds={markerIdsByPositionId.get(i) || []}
                    navigateMarkers={navigateMarkers}
                  />
                )}
              </BusToolTip>
            </Popup>
          </Marker>
        )
      })}
      {positions.length > 0 && (
        <Polyline
          pathOptions={{ color: actualRouteLineColor }}
          positions={positions.map((position) => position.loc)}
        />
      )}
    </>
  )
}

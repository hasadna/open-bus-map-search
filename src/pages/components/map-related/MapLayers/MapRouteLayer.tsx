import type { Layer } from 'leaflet'
import { useCallback, useMemo, useRef } from 'react'
import { Marker, Polyline, Popup } from 'react-leaflet'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { busIcon, busIconPath } from '../../utils/BusIcon'
import type { Point } from '../map-types'
import { actualRouteLineColor, actualRouteStopMarker } from '../MapContent'
import { BusToolTip } from './BusToolTip'
import BusToolTipFooter from './BusToolTipFooter'

interface MapRouteLayerProps {
  positions: Point[]
  showNavigationButtons?: boolean
  navigateMarkers: (id: number, marker: Layer) => void
}

export function MapRouteLayer({
  positions,
  showNavigationButtons,
  navigateMarkers,
}: MapRouteLayerProps) {
  const markerRef = useRef<{ [key: number]: Layer | null }>({})
  const agencyList = useAgencyList()

  const markerIdsByPositionId = useMemo(() => {
    const markerIds = positions.map((_, index) => index)
    return new Map(markerIds.map((markerId) => [markerId, markerIds]))
  }, [positions])

  const navigateToMarker = useCallback(
    (id: number) => {
      if (markerRef.current[id]) navigateMarkers(id, markerRef.current[id])
    },
    [navigateMarkers],
  )

  return (
    <>
      <Polyline
        pathOptions={{ color: actualRouteLineColor }}
        positions={positions.map((position) => position.loc)}
      />

      {positions.map((pos, i) => {
        const icon =
          i === 0
            ? busIcon({
                // eslint-disable-next-line i18next/no-literal-string -- icon lookup key, not user text
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
                  <BusToolTipFooter
                    currentMarkerId={i}
                    markerIds={markerIdsByPositionId.get(i) || []}
                    navigateToMarker={navigateToMarker}
                  />
                )}
              </BusToolTip>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

import type { Layer } from 'leaflet'
import { Fragment, useCallback, useRef } from 'react'
import { Marker, Polyline, Popup } from 'react-leaflet'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { busIcon, busIconPath } from '../../utils/BusIcon'
import type { PositionGroup } from '../map-types'
import { actualRouteStopMarker } from '../MapContent'
import { BusToolTip } from './BusToolTip'
import BusToolTipFooter from './BusToolTipFooter'

interface MapRouteLayerProps {
  positionGroups: PositionGroup[]
  showNavigationButtons?: boolean
  navigateMarkers: (groupIndex: number, id: number, marker: Layer) => void
}

export function MapRouteLayer({
  positionGroups,
  showNavigationButtons,
  navigateMarkers,
}: MapRouteLayerProps) {
  const markerRef = useRef<{ [key: string]: Layer | null }>({})
  const agencyList = useAgencyList()

  const navigateToMarker = useCallback(
    (groupIndex: number, id: number) => {
      const key = `${groupIndex}-${id}`
      if (markerRef.current[key]) navigateMarkers(groupIndex, id, markerRef.current[key])
    },
    [navigateMarkers],
  )

  return (
    <>
      {positionGroups.map((group, groupIndex) => {
        const markerIds = group.positions.map((_, i) => i)
        return (
          <Fragment key={groupIndex}>
            <Polyline
              pathOptions={{ color: group.color }}
              positions={group.positions.map((p) => p.loc)}
            />
            {group.positions.map((pos, i) => {
              const markerKey = `${groupIndex}-${i}`
              const icon =
                i === 0
                  ? busIcon({
                      operator_id: pos.operator?.toString() || 'default',
                      name: agencyList.find((agency) => agency.operatorRef === pos.operator)
                        ?.agencyName,
                    })
                  : actualRouteStopMarker
              return (
                <Marker
                  ref={(ref) => {
                    markerRef.current[markerKey] = ref
                  }}
                  position={pos.loc}
                  icon={icon}
                  key={markerKey}>
                  <Popup minWidth={300} maxWidth={700}>
                    <BusToolTip position={pos} icon={busIconPath(pos.operator!)}>
                      {showNavigationButtons && (
                        <BusToolTipFooter
                          currentMarkerId={i}
                          markerIds={markerIds}
                          navigateToMarker={(id) => navigateToMarker(groupIndex, id)}
                        />
                      )}
                    </BusToolTip>
                  </Popup>
                </Marker>
              )
            })}
          </Fragment>
        )
      })}
    </>
  )
}

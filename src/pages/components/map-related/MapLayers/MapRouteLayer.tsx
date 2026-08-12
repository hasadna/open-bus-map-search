import type { Layer } from 'leaflet'
import { Fragment, useCallback, useRef } from 'react'
import { Marker, Polyline, Popup } from 'react-leaflet'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { busIcon, busIconPath } from '../../utils/BusIcon'
import type { Point, PositionGroup } from '../map-types'
import { rideEndMarker, vehicleBearingMarker, vehicleStandingMarker } from '../MapContent'
import {
  bearingZIndex,
  BOOKEND_Z_INDEX,
  isStanding,
  speedBand,
  STANDING_Z_INDEX,
} from '../vehicleBearingGlyph'
import { BusToolTip } from './BusToolTip'
import BusToolTipFooter from './BusToolTipFooter'

interface MapRouteLayerProps {
  positionGroups: PositionGroup[]
  showNavigationButtons?: boolean
  navigateMarkers: (groupIndex: number, id: number, marker: Layer) => void
}

/**
 * A ping the vehicle reported moving becomes an arrow along its bearing, grown and filled in by
 * how fast; one it reported standing at (velocity exactly 0) becomes the compass badge, which
 * still faces the way the bus did. Both read the same `velocity` the tooltip prints, so the
 * shape can never contradict the number behind it — and both carry the stacking order that
 * keeps the small glyphs on top of the big ones.
 *
 * (`Point.color` holds that velocity, not a colour — see `toPoint`.)
 */
function pingMarker({ bearing, color: velocity }: Point) {
  // Only the standing badge can say "heading unknown" (it drops its needle); a moving ping has
  // to point somewhere, and `toPoint` has already defaulted a missing SIRI bearing to 0 anyway.
  return isStanding(velocity)
    ? { icon: vehicleStandingMarker(bearing), zIndexOffset: STANDING_Z_INDEX }
    : {
        icon: vehicleBearingMarker(bearing ?? 0, velocity),
        zIndexOffset: bearingZIndex(speedBand(velocity)),
      }
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
              // The ride is bookended: its operator's logo where it started, a chequered disc
              // where it was last seen. A one-ping ride keeps the logo — it never got to finish.
              const { icon, zIndexOffset } =
                i === 0
                  ? {
                      icon: busIcon({
                        // eslint-disable-next-line i18next/no-literal-string -- icon lookup key, not user text
                        operator_id: pos.operator?.toString() || 'default',
                        name: agencyList.find((agency) => agency.operatorRef === pos.operator)
                          ?.agencyName,
                      }),
                      zIndexOffset: BOOKEND_Z_INDEX,
                    }
                  : i === group.positions.length - 1
                    ? { icon: rideEndMarker, zIndexOffset: BOOKEND_Z_INDEX }
                    : pingMarker(pos)
              return (
                <Marker
                  ref={(ref) => {
                    markerRef.current[markerKey] = ref
                  }}
                  position={pos.loc}
                  icon={icon}
                  zIndexOffset={zIndexOffset}
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

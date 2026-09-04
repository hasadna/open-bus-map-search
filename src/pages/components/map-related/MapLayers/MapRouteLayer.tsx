import type { Layer } from 'leaflet'
import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'
import { Marker, Polyline, Popup } from 'react-leaflet'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { busIcon, busIconPath } from '../../utils/BusIcon'
import { isPlausibleLocation } from '../../utils/gpsIntegrity'
import type { FocusTarget, Point, PositionGroup } from '../map-types'
import {
  claimedRouteDashArray,
  implausibleSegmentDashArray,
  rideEndMarker,
  vehicleBearingMarker,
  vehicleStandingMarker,
} from '../mapMarkers'
import { buildRoutePolylines } from '../routePolylines'
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
  focusTarget?: FocusTarget | null
  flagGpsArtifacts?: boolean
}

/** `Point.color` holds the ping's velocity, not a colour — see `toPoint`. */
function pingMarker({ bearing, color: velocity }: Point, artifact = false) {
  // Only the standing badge can say "heading unknown" (it drops its needle); a moving ping has
  // to point somewhere, and `toPoint` has already defaulted a missing SIRI bearing to 0 anyway.
  return isStanding(velocity)
    ? { icon: vehicleStandingMarker(bearing, artifact), zIndexOffset: STANDING_Z_INDEX }
    : {
        icon: vehicleBearingMarker(bearing ?? 0, velocity, artifact),
        zIndexOffset: bearingZIndex(speedBand(velocity)),
      }
}

export function MapRouteLayer({
  positionGroups,
  showNavigationButtons,
  navigateMarkers,
  focusTarget,
  flagGpsArtifacts,
}: MapRouteLayerProps) {
  const markerRef = useRef<{ [key: string]: Layer | null }>({})
  const agencyList = useAgencyList()
  const polylinesByGroup = useMemo(
    () =>
      flagGpsArtifacts ? positionGroups.map((group) => buildRoutePolylines(group.positions)) : null,
    [flagGpsArtifacts, positionGroups],
  )

  const navigateToMarker = useCallback(
    (groupIndex: number, id: number) => {
      const key = `${groupIndex}-${id}`
      if (markerRef.current[key]) navigateMarkers(groupIndex, id, markerRef.current[key])
    },
    [navigateMarkers],
  )

  // Only the popup — MapContent owns the fly-to for the same focusTarget, and two
  // competing animations would fight over the viewport.
  useEffect(() => {
    const marker = focusTarget?.marker
    if (!marker) return
    markerRef.current[`${marker.groupIndex}-${marker.positionIndex}`]?.openPopup()
  }, [focusTarget])

  return (
    <>
      {positionGroups.map((group, groupIndex) => {
        const markerIds = group.positions.map((_, i) => i)
        const polylines = polylinesByGroup?.[groupIndex]
        // The operator's logo and the chequered flag mark where the ride began and ended, so
        // they belong to the fixes drawn solid — never to a spoofed one, and never to a cluster
        // the ride could not have driven to.
        const body = polylines && new Set(polylines.body)
        const routeIndexes = group.positions
          .map((pos, i) => (body && !body.has(pos) ? -1 : i))
          .filter((i) => i >= 0)
        const firstIndex = routeIndexes[0]
        const lastIndex = routeIndexes.at(-1)
        return (
          <Fragment key={groupIndex}>
            {polylines ? (
              <>
                {polylines.route.map((path, i) => (
                  <Polyline
                    key={`route-${i}`}
                    pathOptions={{
                      color: group.color,
                      dashArray: path.dashed ? implausibleSegmentDashArray : undefined,
                    }}
                    positions={path.positions}
                  />
                ))}
                {polylines.claimed.map((path, i) => (
                  <Polyline
                    key={`claimed-${i}`}
                    pathOptions={{ color: group.color, dashArray: claimedRouteDashArray }}
                    positions={path}
                  />
                ))}
              </>
            ) : (
              <Polyline
                pathOptions={{ color: group.color }}
                positions={group.positions.map((p) => p.loc)}
              />
            )}
            {group.positions.map((pos, i) => {
              const markerKey = `${groupIndex}-${i}`
              // A one-ping ride keeps the operator's logo — it never got to finish.
              const { icon, zIndexOffset } =
                polylines && !isPlausibleLocation(pos.loc)
                  ? pingMarker(pos, true)
                  : i === firstIndex
                    ? {
                        icon: busIcon({
                          // eslint-disable-next-line i18next/no-literal-string -- icon lookup key, not user text
                          operator_id: pos.operator?.toString() || 'default',
                          name: agencyList.find((agency) => agency.operatorRef === pos.operator)
                            ?.agencyName,
                        }),
                        zIndexOffset: BOOKEND_Z_INDEX,
                      }
                    : i === lastIndex
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

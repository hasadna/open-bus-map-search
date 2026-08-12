import type { Layer } from 'leaflet'
import { Fragment, useCallback, useMemo, useRef } from 'react'
import { Marker, Polyline, Popup } from 'react-leaflet'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { busIcon, busIconPath } from '../../utils/BusIcon'
import { pingSpeedsKmh } from '../../utils/gpsCoverage'
import type { Point, PositionGroup } from '../map-types'
import { actualRouteStopMarker, vehicleBearingMarker } from '../MapContent'
import { STANDING_KMH } from '../vehicleBearingGlyph'
import { BusToolTip } from './BusToolTip'
import BusToolTipFooter from './BusToolTipFooter'

interface MapRouteLayerProps {
  positionGroups: PositionGroup[]
  showNavigationButtons?: boolean
  navigateMarkers: (groupIndex: number, id: number, marker: Layer) => void
}

/**
 * A moving ping becomes an arrow pointing along its bearing, grown and filled in by how fast
 * the bus was going; a standing one keeps the ring, since a parked vehicle has no direction of
 * travel to point at.
 *
 * Speed is the ground the ride actually covered to its next fix, not the ping's own SIRI
 * reading: that reading is a spot measurement, and it says 0 for a bus merely caught between
 * stops (see {@link pingSpeedsKmh}). Where the timing can't support a derived figure — a lone
 * ping, a frozen clock, a reporting dropout — the reading is all there is, so it stands in.
 *
 * (`Point.color` holds that reading, not a colour — see `toPoint`.)
 */
function pingIcon({ bearing, color: reportedKmh }: Point, derivedKmh?: number) {
  const kmh = derivedKmh ?? reportedKmh
  return kmh >= STANDING_KMH && bearing !== undefined
    ? vehicleBearingMarker(bearing, kmh)
    : actualRouteStopMarker
}

export function MapRouteLayer({
  positionGroups,
  showNavigationButtons,
  navigateMarkers,
}: MapRouteLayerProps) {
  const markerRef = useRef<{ [key: string]: Layer | null }>({})
  const agencyList = useAgencyList()

  // Derived per group, not per ping: the speed at a ping is a property of the pair it forms
  // with its neighbour, so it needs the whole ride to hand.
  const groupSpeeds = useMemo(
    () => positionGroups.map((group) => pingSpeedsKmh(group.positions)),
    [positionGroups],
  )

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
                      // eslint-disable-next-line i18next/no-literal-string -- icon lookup key, not user text
                      operator_id: pos.operator?.toString() || 'default',
                      name: agencyList.find((agency) => agency.operatorRef === pos.operator)
                        ?.agencyName,
                    })
                  : pingIcon(pos, groupSpeeds[groupIndex][i])
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

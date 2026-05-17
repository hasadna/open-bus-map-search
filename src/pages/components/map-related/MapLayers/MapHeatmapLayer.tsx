import { useCallback, useMemo, useRef } from 'react'
import { CircleMarker, Polyline, Popup, useMap } from 'react-leaflet'
import { busIconPath } from '../../utils/BusIcon'
import type { Point } from '../map-types'
import MapFooterButtons from '../MapFooterButtons/MapFooterButtons'
import { BusToolTip } from './BusToolTip'

type PopupLayerRef = {
  openPopup: () => void
}

interface MapHeatmapLayerProps {
  positions: Point[]
}

function getRidePolylineKey(position: Point, fallbackIndex: number) {
  const vehicleRef = position.point?.siriRideVehicleRef
  const scheduledStartTime = position.point?.siriRideScheduledStartTime

  if (!vehicleRef || !scheduledStartTime) {
    return `single-point-${fallbackIndex}`
  }

  return `${vehicleRef}-${new Date(scheduledStartTime).toISOString()}`
}

function groupRidePolylines(positions: Point[]) {
  const groupedPositions = new Map<string, { markerId: number; position: Point }[]>()

  positions.forEach((position, index) => {
    const key = getRidePolylineKey(position, index)
    const group = groupedPositions.get(key)
    const indexedPosition = { markerId: index, position }
    if (group) {
      group.push(indexedPosition)
    } else {
      groupedPositions.set(key, [indexedPosition])
    }
  })

  return Array.from(groupedPositions.entries()).map(([key, indexedRidePositions]) => {
    const positionsWithIds = indexedRidePositions
      .filter(({ position }) => position.loc[0] && position.loc[1])
      .sort((a, b) => (a.position.recordedAtTime || 0) - (b.position.recordedAtTime || 0))

    return {
      key,
      markerIds: positionsWithIds.map(({ markerId }) => markerId),
      positions: positionsWithIds.map(({ position }) => position),
    }
  })
}

export function MapHeatmapLayer({ positions }: MapHeatmapLayerProps) {
  const markerRef = useRef<{ [key: number]: PopupLayerRef | null }>({})
  const map = useMap()

  const ridePolylines = useMemo(() => groupRidePolylines(positions), [positions])
  const markerIdsByPositionId = useMemo(
    () =>
      new Map(
        ridePolylines.flatMap((ride) =>
          ride.markerIds.map((markerId): [number, number[]] => [markerId, ride.markerIds]),
        ),
      ),
    [ridePolylines],
  )

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
      {ridePolylines
        .filter((ride) => ride.positions.length > 1)
        .map((ride) => (
          <Polyline
            key={ride.key}
            pathOptions={{ color: 'darkRed', opacity: 0.33 }}
            positions={ride.positions.map((position) => position.loc)}
          />
        ))}

      {positions.map((pos, i) => (
        <CircleMarker
          ref={(ref) => {
            markerRef.current[i] = ref
          }}
          key={`${pos.loc[0]}-${pos.loc[1]}-${pos.recordedAtTime}-${i}`}
          center={pos.loc}
          pathOptions={{
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.19,
            opacity: 0.33,
            weight: 1,
          }}
          radius={8}>
          <Popup minWidth={300} maxWidth={700}>
            <BusToolTip position={pos} icon={busIconPath(pos.operator!)}>
              <MapFooterButtons
                currentMarkerId={i}
                markerIds={markerIdsByPositionId.get(i) || []}
                navigateMarkers={navigateMarkers}
              />
            </BusToolTip>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}

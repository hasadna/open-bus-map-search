import type { Layer } from 'leaflet'
import { useCallback, useMemo, useRef } from 'react'
import { CircleMarker, Polyline, Popup } from 'react-leaflet'
import { busIconPath } from '../../utils/BusIcon'
import type { Point } from '../map-types'
import MapFooterButtons from '../MapFooterButtons/MapFooterButtons'
import { BusToolTip } from './BusToolTip'

interface MapHeatmapLayerProps {
  positions: Point[]
  navigateMarkers: (id: number, marker: Layer) => void
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

export function MapHeatmapLayer({ positions, navigateMarkers }: MapHeatmapLayerProps) {
  const markerRef = useRef<{ [key: number]: Layer | null }>({})

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

  const navigateToMarker = useCallback(
    (id: number) => {
      if (markerRef.current[id]) navigateMarkers(id, markerRef.current[id])
    },
    [navigateMarkers],
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
                navigateToMarker={navigateToMarker}
              />
            </BusToolTip>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}

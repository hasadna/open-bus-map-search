import { Marker, Polyline } from 'react-leaflet'
import type { BusStop } from 'src/model/busStop'
import { plannedRouteLineColor, plannedRouteStopMarker } from '../MapContent'

interface MapPlannedRouteLayerProps {
  plannedRouteStops: BusStop[]
}

export function MapPlannedRouteLayer({ plannedRouteStops }: MapPlannedRouteLayerProps) {
  return (
    <>
      <Polyline
        pathOptions={{ color: plannedRouteLineColor }}
        positions={plannedRouteStops.map((stop) => [
          stop.location.latitude,
          stop.location.longitude,
        ])}
      />

      {plannedRouteStops.map((stop) => (
        <Marker
          key={stop.key}
          position={[stop.location.latitude, stop.location.longitude]}
          icon={plannedRouteStopMarker}
        />
      ))}
    </>
  )
}

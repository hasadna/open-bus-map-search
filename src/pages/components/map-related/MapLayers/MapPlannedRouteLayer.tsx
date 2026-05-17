import type { Icon } from 'leaflet'
import { Marker, Polyline } from 'react-leaflet'
import type { BusStop } from 'src/model/busStop'

interface MapPlannedRouteLayerProps {
  plannedRouteLineColor: string
  plannedRouteStopMarker: Icon
  plannedRouteStops: BusStop[]
}

export function MapPlannedRouteLayer({
  plannedRouteLineColor,
  plannedRouteStopMarker,
  plannedRouteStops,
}: MapPlannedRouteLayerProps) {
  return (
    <>
      <Polyline
        pathOptions={{ color: plannedRouteLineColor }}
        positions={plannedRouteStops.map((stop) => [
          stop.location.latitude,
          stop.location.longitude,
        ])}
      />
      {plannedRouteStops.map((stop) => {
        const { latitude, longitude } = stop.location
        return (
          <Marker key={stop.key} position={[latitude, longitude]} icon={plannedRouteStopMarker} />
        )
      })}
    </>
  )
}

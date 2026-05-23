import { Marker, Polyline, Popup } from 'react-leaflet'
import type { BusStop } from 'src/model/busStop'
import { plannedRouteLineColor, plannedRouteStopMarker } from '../MapContent'

interface MapPlannedRouteLayerProps {
  plannedRouteStops?: BusStop[]
}

export function MapPlannedRouteLayer({ plannedRouteStops = [] }: MapPlannedRouteLayerProps) {
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
        const totalMinutes = stop.minutesFromRouteStartTime
        const h = Math.floor(totalMinutes / 60)
        const m = totalMinutes % 60
        const arrivalLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} from start`

        return (
          <Marker
            key={stop.key}
            position={[stop.location.latitude, stop.location.longitude]}
            icon={plannedRouteStopMarker}>
            <Popup>
              <strong>{stop.name}</strong>
              <br />
              Stop {stop.code} · #{stop.stopSequence}
              <br />
              {arrivalLabel}
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

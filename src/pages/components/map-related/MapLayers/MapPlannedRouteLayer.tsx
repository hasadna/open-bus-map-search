import { useTranslation } from 'react-i18next'
import { Marker, Polyline, Tooltip } from 'react-leaflet'
import type { BusStop } from 'src/model/busStop'
import { plannedRouteLineColor, plannedRouteStopMarker } from '../MapContent'

interface MapPlannedRouteLayerProps {
  plannedRouteStops?: BusStop[]
}

export function MapPlannedRouteLayer({ plannedRouteStops = [] }: MapPlannedRouteLayerProps) {
  const { t } = useTranslation()

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
          icon={plannedRouteStopMarker}>
          <Tooltip direction="top" offset={[0, -12]}>
            <strong>{stop.name}</strong>
            <br />
            {t('lineProfile.stop.code')}: {stop.code} · {stop.stopSequence}{' '}
            {t('lineProfile.stop.of')} {plannedRouteStops.length}
            <br />
            {t('minutes_from_route_start', { minutes: stop.minutesFromRouteStartTime })}
          </Tooltip>
        </Marker>
      ))}
    </>
  )
}

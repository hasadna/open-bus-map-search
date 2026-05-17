import { t } from 'i18next'
import { MapIndex } from '../MapIndex'

interface MapIndexLayerProps {
  actualRouteLineColor: string
  actualRouteStopMarkerPath: string
  heatmapMode?: boolean
  plannedRouteLineColor: string
  plannedRouteStopMarkerPath: string
  showPlannedRoute?: boolean
}

export function MapIndexLayer({
  actualRouteLineColor,
  actualRouteStopMarkerPath,
  heatmapMode,
  plannedRouteLineColor,
  plannedRouteStopMarkerPath,
  showPlannedRoute,
}: MapIndexLayerProps) {
  return (
    <div className="map-index">
      {!heatmapMode && (
        <MapIndex
          lineColor={actualRouteLineColor}
          imgSrc={actualRouteStopMarkerPath}
          title={t('actualRoute')}
        />
      )}
      {showPlannedRoute && (
        <MapIndex
          lineColor={plannedRouteLineColor}
          imgSrc={plannedRouteStopMarkerPath}
          title={t('plannedRoute')}
        />
      )}
    </div>
  )
}

import { t } from 'i18next'
import {
  actualRouteLineColor,
  actualRouteStopMarkerPath,
  plannedRouteLineColor,
  plannedRouteStopMarkerPath,
} from '../MapContent'
import { MapIndex } from '../MapIndex'

interface MapIndexLayerProps {
  heatmapMode?: boolean
  showPlannedRoute?: boolean
}

export function MapIndexLayer({ heatmapMode, showPlannedRoute }: MapIndexLayerProps) {
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

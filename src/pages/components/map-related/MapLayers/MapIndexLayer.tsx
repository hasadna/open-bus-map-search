import { t } from 'i18next'
import { MapIndex } from '../MapIndex'

interface MapIndexLayerProps {
  actualRouteLineColor: string
  actualRouteStopMarkerPath: string
  plannedRouteLineColor: string
  plannedRouteStopMarkerPath: string
  showPlannedRoute?: boolean
}

export function MapIndexLayer({
  actualRouteLineColor,
  actualRouteStopMarkerPath,
  plannedRouteLineColor,
  plannedRouteStopMarkerPath,
  showPlannedRoute,
}: MapIndexLayerProps) {
  return (
    <div className="map-index">
      <MapIndex
        lineColor={actualRouteLineColor}
        imgSrc={actualRouteStopMarkerPath}
        title={t('actualRoute')}
      />
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

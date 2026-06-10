import { useTranslation } from 'react-i18next'
import {
  actualRouteLineColor,
  actualRouteStopMarkerPath,
  plannedRouteLineColor,
  plannedRouteStopMarkerPath,
} from '../MapContent'
import { MapIndex } from '../MapIndex'

interface MapIndexLayerProps {
  showPlannedRoute?: boolean
}

export function MapIndexLayer({ showPlannedRoute }: MapIndexLayerProps) {
  const { t } = useTranslation()
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

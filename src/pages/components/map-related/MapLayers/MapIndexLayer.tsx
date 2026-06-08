import { useTranslation } from 'react-i18next'
import { useTheme } from 'src/layout/ThemeContext'
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
  const { isDarkTheme } = useTheme()
  const { t } = useTranslation()
  return (
    <div className={`map-index${isDarkTheme ? ' dark' : ''}`}>
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

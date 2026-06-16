import { useTranslation } from 'react-i18next'
import type { PositionGroup } from '../map-types'
import {
  actualRouteLineColor,
  actualRouteStopMarkerPath,
  plannedRouteLineColor,
  plannedRouteStopMarkerPath,
} from '../MapContent'
import { MapIndex } from '../MapIndex'

interface MapIndexLayerProps {
  showPlannedRoute?: boolean
  positionGroups?: PositionGroup[]
}

export function MapIndexLayer({ showPlannedRoute, positionGroups = [] }: MapIndexLayerProps) {
  const { t } = useTranslation()
  const multiVehicle = positionGroups.length > 1

  return (
    <div className="map-index">
      {showPlannedRoute && (
        <MapIndex
          lineColor={plannedRouteLineColor}
          imgSrc={plannedRouteStopMarkerPath}
          title={t('plannedRoute')}
        />
      )}
      {multiVehicle ? (
        positionGroups.map((group, idx) => (
          <MapIndex
            key={idx}
            lineColor={group.color}
            imgSrc={actualRouteStopMarkerPath}
            title={t('actualRoute')}
            subtitle={`(${group.label ?? idx + 1})`}
          />
        ))
      ) : (
        <MapIndex
          lineColor={positionGroups[0]?.color ?? actualRouteLineColor}
          imgSrc={actualRouteStopMarkerPath}
          title={t('actualRoute')}
        />
      )}
    </div>
  )
}

import { Link as MuiLink } from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { PositionGroup } from '../map-types'
import {
  actualRouteStopMarkerPath,
  plannedRouteLineColor,
  plannedRouteStopMarkerPath,
} from '../MapContent'
import { MapIndex } from '../MapIndex'

interface MapIndexLayerProps {
  showPlannedRoute?: boolean
  positionGroups?: PositionGroup[]
}

function vehicleSubtitle(group: PositionGroup): ReactNode {
  if (!group.label) return undefined
  const number = group.vehicleRef ? (
    <MuiLink
      component={Link}
      to={`/vehicle?vehicleNumber=${group.vehicleRef}`}
      reloadDocument
      underline="hover">
      {group.label}
    </MuiLink>
  ) : (
    group.label
  )
  return (
    <bdi>
      {'('}
      {number}
      {')'}
    </bdi>
  )
}

export function MapIndexLayer({ showPlannedRoute, positionGroups = [] }: MapIndexLayerProps) {
  const { t } = useTranslation()

  return (
    <div className="map-index">
      {showPlannedRoute && (
        <MapIndex
          lineColor={plannedRouteLineColor}
          imgSrc={plannedRouteStopMarkerPath}
          title={t('plannedRoute')}
        />
      )}
      {/* The actual-route entry appears only once a ride is selected (positionGroups
          populated); before that the legend shows just the planned route. */}
      {positionGroups.map((group, idx) => (
        <MapIndex
          key={idx}
          lineColor={group.color}
          imgSrc={actualRouteStopMarkerPath}
          title={t('actualRoute')}
          subtitle={vehicleSubtitle(group)}
        />
      ))}
    </div>
  )
}

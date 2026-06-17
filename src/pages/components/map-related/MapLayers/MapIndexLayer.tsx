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

/** Parenthesized vehicle-number subtitle for a legend row. When the ride's raw
 *  vehicle ref is known it links to the vehicle page; otherwise it falls back to
 *  the plain label (or nothing). reloadDocument: the vehicle page seeds its
 *  number from the URL captured at page load (InitialUrlParamsContext), so this
 *  must be a full navigation, not an in-app SPA transition.
 *  The <bdi> wrapper isolates the parenthesized number as its own run so the
 *  brackets don't mirror to ")12-345-67(" in RTL (he/ar) layouts — the number and
 *  its parens are split across element boundaries, which defeats bidi bracket
 *  matching unless they're isolated. */
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

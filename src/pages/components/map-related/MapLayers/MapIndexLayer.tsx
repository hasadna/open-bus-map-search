import { Link as MuiLink } from '@mui/material'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { OutboundArrow } from 'src/pages/components/OutboundArrow'
import type { PositionGroup } from '../map-types'
import { MapIndex } from '../MapIndex'
import { plannedRouteLineColor, plannedRouteStopMarkerPath } from '../mapMarkers'
import { MapSpeedIndex } from '../MapSpeedIndex'
import { SPEED_BANDS, VehicleBearingGlyph } from '../vehicleBearingGlyph'

interface MapIndexLayerProps {
  showPlannedRoute?: boolean
  positionGroups?: PositionGroup[]
}

function vehicleSubtitle(group: PositionGroup, t: TFunction): ReactNode {
  if (!group.label) return undefined
  const number = group.vehicleRef ? (
    <MuiLink
      component={Link}
      to={`/vehicle?vehicle.vehicleNumber=${group.vehicleRef}`}
      reloadDocument
      underline="hover"
      title={t('go_to_vehicle_page')}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
      {group.label}
      <OutboundArrow />
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
          icon={<img src={plannedRouteStopMarkerPath} alt="" />}
          title={t('plannedRoute')}
        />
      )}
      {/* The actual-route entry appears only once a ride is selected (positionGroups
          populated); before that the legend shows just the planned route. */}
      {positionGroups.map((group, idx) => (
        <MapIndex
          key={idx}
          lineColor={group.color}
          // A mid-ramp arrow stands for the whole family; MapSpeedIndex below spells the bands out.
          icon={<VehicleBearingGlyph band={SPEED_BANDS[SPEED_BANDS.length - 2]} />}
          title={t('actualRoute')}
          subtitle={vehicleSubtitle(group, t)}
        />
      ))}
      {positionGroups.length > 0 && <MapSpeedIndex />}
    </div>
  )
}

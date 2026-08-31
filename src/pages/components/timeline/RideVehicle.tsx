import { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { Link as MuiLink } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toIsraelTimezone } from 'src/dayjs'
import { OutboundArrow } from 'src/pages/components/OutboundArrow'
import { CardRow } from 'src/pages/components/timeline/CardRow'
import { vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'

/** The longest a plate can render: 8 digits group as 000-00-0000. */
export const WIDEST_VEHICLE: SiriVehicleLocationWithRelatedPydanticModel = {
  siriRideVehicleRef: '00000000',
}

/**
 * Dated off the departure, not the day being browsed: the timeline searches ±4h, so a hit
 * near midnight can belong to the neighbouring day.
 */
const vehiclePageLink = (hit: SiriVehicleLocationWithRelatedPydanticModel) => {
  const params = new URLSearchParams({ 'vehicle.vehicleNumber': hit.siriRideVehicleRef! })
  if (hit.siriRideScheduledStartTime) {
    params.set('date', toIsraelTimezone(hit.siriRideScheduledStartTime).format('YYYY-MM-DD'))
  }
  return `/vehicle?${params.toString()}`
}

export const RideVehicle = ({ hit }: { hit: SiriVehicleLocationWithRelatedPydanticModel }) => {
  const { t } = useTranslation()
  const plate = vehicleIDFormat(hit.siriRideVehicleRef)
  if (!plate) return null

  return (
    <CardRow label={t('vehicle_ref')}>
      {/* A real navigation: the vehicle page reads its number out of the query string,
          which only happens on a fresh app mount. */}
      <MuiLink
        component={Link}
        to={vehiclePageLink(hit)}
        reloadDocument
        underline="hover"
        title={t('go_to_vehicle_page')}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, fontWeight: 'bold' }}>
        <bdi>{plate}</bdi>
        <OutboundArrow />
      </MuiLink>
    </CardRow>
  )
}

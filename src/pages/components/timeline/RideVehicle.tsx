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
 * Where the vehicle page should open for a stop-hit: on the bus that drove the ride, on the
 * day the ride departed rather than the day being browsed. The timeline searches ±4h, so a
 * hit near midnight can belong to the neighbouring day — the same reason
 * `buildSingleLineMapRideLink` dates its link off the departure.
 */
const vehiclePageLink = (hit: SiriVehicleLocationWithRelatedPydanticModel) => {
  const params = new URLSearchParams({ 'vehicle.vehicleNumber': hit.siriRideVehicleRef! })
  if (hit.siriRideScheduledStartTime) {
    params.set('date', toIsraelTimezone(hit.siriRideScheduledStartTime).format('YYYY-MM-DD'))
  }
  return `/vehicle?${params.toString()}`
}

/**
 * The plate of the bus that drove this ride — issue #1728, so a rider who left something on
 * board can tell the operator which bus it was.
 *
 * It rides along on the vehicle-location record, so it costs no extra request. A record
 * without one renders nothing, leaving the card as a bare time.
 */
export const RideVehicle = ({ hit }: { hit: SiriVehicleLocationWithRelatedPydanticModel }) => {
  const { t } = useTranslation()
  const plate = vehicleIDFormat(hit.siriRideVehicleRef)
  if (!plate) return null

  return (
    <CardRow label={t('vehicle_ref')}>
      {/* Followed as a real navigation: the vehicle page reads its number out of the query
          string, which only happens on a fresh app mount. */}
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

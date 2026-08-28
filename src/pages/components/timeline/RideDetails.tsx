import { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { Box } from '@mui/material'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { toIsraelTimezone } from 'src/dayjs'
import { vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'

/** A hit that carries neither field gets no tooltip at all, rather than an empty one. */
export const hasRideDetails = (hit: SiriVehicleLocationWithRelatedPydanticModel) =>
  Boolean(hit.siriRideScheduledStartTime || hit.siriRideVehicleRef)

/**
 * Which ride a stop-hit came from: the departure it belongs to, and the bus that drove it.
 *
 * Both fields travel on the vehicle-location record itself, so this costs no extra request.
 * The ride's *actual* start time is deliberately absent: it is only reachable through
 * `siri_ride__first_vehicle_location_id`, which the ETL leaves null for most rides.
 */
export const RideDetails = ({ hit }: { hit: SiriVehicleLocationWithRelatedPydanticModel }) => {
  const { t } = useTranslation()

  const rows: [label: string, value: string][] = []
  if (hit.siriRideScheduledStartTime) {
    rows.push([
      t('timeline_ride_scheduled_start'),
      toIsraelTimezone(hit.siriRideScheduledStartTime).format('HH:mm'),
    ])
  }
  const vehicle = vehicleIDFormat(hit.siriRideVehicleRef)
  if (vehicle) rows.push([t('vehicle_ref'), vehicle])

  return (
    <Box
      component="dl"
      sx={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 1 }}>
      {rows.map(([label, value]) => (
        <Fragment key={label}>
          <Box component="dt">{`${label}:`}</Box>
          <Box component="dd" sx={{ margin: 0, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {value}
          </Box>
        </Fragment>
      ))}
    </Box>
  )
}

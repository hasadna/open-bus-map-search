import { useTranslation } from 'react-i18next'
import dayjs from 'src/dayjs'
import type { PositionGroup } from 'src/pages/components/map-related/map-types'
import Widget from 'src/shared/Widget'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { vehicleIDFormat } from '../components/utils/rotueUtils'

export const LineProfileRide = ({ positionGroups }: { positionGroups: PositionGroup[] }) => {
  const { t } = useTranslation()
  const point = positionGroups[0]?.positions[0]?.point
  const vehiclePlates = positionGroups
    .map(
      (group) =>
        group.label ??
        vehicleIDFormat(group.vehicleRef ?? group.positions[0]?.point?.siriRideVehicleRef),
    )
    .filter(Boolean)
    .join(', ')

  return (
    <Widget>
      <InfoTable>
        <InfoItem label={t('lineProfile.ride.journey')} value={point?.siriRideJourneyRef} />
        <InfoItem label={t('lineProfile.ride.id')} value={point?.siriRideId?.toString()} />
        <InfoItem label={t('vehicle_refs')} value={vehiclePlates || undefined} />
        <InfoItem
          label={t('lineProfile.ride.duration')}
          value={
            point?.siriRideDurationMinutes
              ? `${point?.siriRideDurationMinutes} ${t('minutes')}`
              : undefined
          }
        />
        <InfoItem
          label={t('lineProfile.ride.scheduled')}
          value={
            point?.siriRideScheduledStartTime
              ? dayjs(point?.siriRideScheduledStartTime).format(t('datetime_format'))
              : undefined
          }
        />
      </InfoTable>
    </Widget>
  )
}

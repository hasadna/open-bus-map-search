import { SiriVehicleLocationWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { useTranslation } from 'react-i18next'
import dayjs from 'src/dayjs'
import Widget from 'src/shared/Widget'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { vehicleIDFormat } from '../components/utils/rotueUtils'

export const LineProfileRide = ({
  point,
}: {
  point?: SiriVehicleLocationWithRelatedPydanticModel
}) => {
  const { t } = useTranslation()

  return (
    <Widget>
      <InfoTable>
        <InfoItem label={t('lineProfile.ride.journey ')} value={point?.siriRideJourneyRef} />
        <InfoItem label={t('lineProfile.ride.id')} value={point?.siriRideId} />
        <InfoItem label={t('vehicle_ref')} value={vehicleIDFormat(point?.siriRideVehicleRef)} />
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

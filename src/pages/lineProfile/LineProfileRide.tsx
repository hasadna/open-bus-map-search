import { useTranslation } from 'react-i18next'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { vehicleIDFormat } from '../components/utils/rotueUtils'
import { VehicleLocation } from 'src/model/vehicleLocation'
import Widget from 'src/shared/Widget'
import dayjs from 'src/dayjs'

export const LineProfileRide = ({ point }: { point?: VehicleLocation }) => {
  const { t } = useTranslation()

  return (
    <Widget>
      <InfoTable>
        <InfoItem label={t('lineProfile.ride.journey ')} value={point?.siri_ride__journey_ref} />
        <InfoItem label={t('lineProfile.ride.id')} value={point?.siri_ride__id} />
        <InfoItem label={t('vehicle_ref')} value={vehicleIDFormat(point?.siri_ride__vehicle_ref)} />
        <InfoItem
          label={t('lineProfile.ride.duration')}
          value={
            point?.siri_ride__duration_minutes
              ? `${point?.siri_ride__duration_minutes} ${t('minutes')}`
              : undefined
          }
        />
        <InfoItem
          label={t('lineProfile.ride.scheduled')}
          value={
            point?.siri_ride__scheduled_start_time
              ? dayjs(point?.siri_ride__scheduled_start_time).format(t('datetime_format'))
              : undefined
          }
        />
      </InfoTable>
    </Widget>
  )
}

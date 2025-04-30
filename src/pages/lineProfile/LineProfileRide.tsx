import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { vehicleIDFormat } from '../components/utils/rotueUtils'
import { VehicleLocation } from 'src/model/vehicleLocation'
import Widget from 'src/shared/Widget'

export const LineProfileRide = ({ point }: { point?: VehicleLocation }) => {
  const { t } = useTranslation()

  return (
    <Widget>
      <InfoTable>
        <InfoItem lable={t('lineProfile.ride.journey ')} value={point?.siri_ride__journey_ref} />
        <InfoItem lable={t('lineProfile.ride.id')} value={point?.siri_ride__id} />
        <InfoItem lable={t('vehicle_ref')} value={vehicleIDFormat(point?.siri_ride__vehicle_ref)} />
        <InfoItem
          lable={t('lineProfile.ride.duration')}
          value={
            point?.siri_ride__duration_minutes &&
            `${point?.siri_ride__duration_minutes} ${t('minutes')}`
          }
        />
        <InfoItem
          lable={t('lineProfile.ride.scheduled')}
          value={
            point?.siri_ride__scheduled_start_time &&
            moment(point?.siri_ride__scheduled_start_time).format(t('datetime_format'))
          }
        />
      </InfoTable>
    </Widget>
  )
}

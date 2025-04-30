import { useTranslation } from 'react-i18next'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { BusStop } from 'src/model/busStop'
import Widget from 'src/shared/Widget'

export const LineProfileStop = ({ stop, total }: { stop?: BusStop; total: number }) => {
  const { t } = useTranslation()

  const stopRoute = `${stop?.stopSequence} ${t('lineProfile.stop.of')} ${total} (${stop?.minutesFromRouteStartTime} ${t('minutes')})`
  const stopLocation = `${stop?.location.latitude}, ${stop?.location.longitude}`

  return (
    <Widget>
      <InfoTable>
        <InfoItem lable={t('lineProfile.stop.name')} value={stop?.name} />
        <InfoItem lable={t('lineProfile.stop.code')} value={stop?.code} />
        <InfoItem lable={t('lineProfile.stop.route')} value={stop && stopRoute} />
        <InfoItem lable={t('lineProfile.stop.location')} value={stop?.location && stopLocation} />
      </InfoTable>
    </Widget>
  )
}

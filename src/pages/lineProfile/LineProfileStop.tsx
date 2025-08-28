import { useTranslation } from 'react-i18next'
import { BusStop } from 'src/model/busStop'
import Widget from 'src/shared/Widget'
import { InfoItem, InfoTable } from '../components/InfoTable'

export const LineProfileStop = ({ stop, total }: { stop?: BusStop; total: number }) => {
  const { t } = useTranslation()

  const stopRoute = `${stop?.stopSequence} ${t('lineProfile.stop.of')} ${total} (${stop?.minutesFromRouteStartTime} ${t('minutes')})`
  const stopLocation = `${stop?.location.latitude}, ${stop?.location.longitude}`

  return (
    <Widget>
      <InfoTable>
        <InfoItem label={t('lineProfile.stop.name')} value={stop?.name} />
        <InfoItem label={t('lineProfile.stop.code')} value={stop?.code} />
        <InfoItem label={t('lineProfile.stop.route')} value={stop ? stopRoute : undefined} />
        <InfoItem
          label={t('lineProfile.stop.location')}
          value={stop?.location ? stopLocation : undefined}
        />
      </InfoTable>
    </Widget>
  )
}

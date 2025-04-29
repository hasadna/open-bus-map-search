// import { useTranslation } from 'react-i18next'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { BusStop } from 'src/model/busStop'
import Widget from 'src/shared/Widget'

export const LineProfileStop = ({ stop }: { stop?: BusStop }) => {
  // const { t } = useTranslation()

  return (
    <Widget>
      <InfoTable>
        <InfoItem lable="Stop Name" value={stop?.name} />
        <InfoItem lable="Stop Code" value={stop?.code} />
        <InfoItem lable="Stop Sequence" value={stop?.stopSequence} />
        <InfoItem
          lable="Stop Location"
          value={stop?.location && `${stop.location.latitude}, ${stop.location.longitude}`}
        />
      </InfoTable>
    </Widget>
  )
}

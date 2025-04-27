import { Link } from 'react-router'
import './LineProfileDetails.scss'
import { useTranslation } from 'react-i18next'
import { GtfsRoutePydanticModel } from 'open-bus-stride-client'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { routeStartEnd } from '../components/utils/rotueUtils'

export const LineProfileDetails = ({
  id,
  date,
  lineRef,
  operatorRef,
  routeShortName,
  routeLongName,
  routeMkt,
  routeDirection,
  routeAlternative,
  agencyName,
  routeType,
}: GtfsRoutePydanticModel) => {
  const { t, i18n } = useTranslation()

  const [route_start, route_end] = routeStartEnd(routeLongName)

  const data = [
    { label: t('lineProfile.id'), value: id },
    { label: t('lineProfile.date'), value: date.toLocaleDateString(i18n.language) },
    { label: t('lineProfile.lineReference'), value: lineRef },
    {
      label: t('lineProfile.operatorReference'),
      value: <Link to={'/operator?operatorId=' + operatorRef}>{operatorRef}</Link>,
    },
    {
      label: t('lineProfile.agencyName'),
      value: <Link to={'/operator?operatorId=' + operatorRef}>{agencyName}</Link>,
    },
    { label: t('lineProfile.route.shortName'), value: routeShortName },
    { label: t('lineProfile.route.start'), value: route_start },
    { label: t('lineProfile.route.end'), value: route_end },
    { label: t('lineProfile.route.mkt'), value: routeMkt },
    { label: t('lineProfile.route.direction'), value: routeDirection },
    { label: t('lineProfile.route.type'), value: routeType },
    { label: t('lineProfile.route.alternative'), value: routeAlternative },
  ]

  return (
    <InfoTable>
      {data.map(({ label, value }) => (
        <InfoItem key={`${label}-${value}`} lable={label} value={value} />
      ))}
    </InfoTable>
  )
}

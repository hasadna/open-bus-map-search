import { Link } from 'react-router'
import './LineProfileDetails.scss'
import { useTranslation } from 'react-i18next'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { routeStartEnd } from '../components/utils/rotueUtils'
import { Route } from './Route.interface'

export const LineProfileDetails = ({
  id,
  date,
  line_ref,
  operator_ref,
  route_short_name,
  route_long_name,
  route_mkt,
  route_direction,
  route_alternative,
  agency_name,
  route_type,
}: Route) => {
  const { t } = useTranslation()

  const [route_start, route_end] = routeStartEnd(route_long_name)

  const data = [
    { label: t('lineProfile.id'), value: id },
    { label: t('lineProfile.date'), value: date },
    { label: t('lineProfile.lineReference'), value: line_ref },
    {
      label: t('lineProfile.operatorReference'),
      value: <Link to={'/operator?operatorId=' + operator_ref}>{operator_ref}</Link>,
    },
    {
      label: t('lineProfile.agencyName'),
      value: <Link to={'/operator?operatorId=' + operator_ref}>{agency_name}</Link>,
    },
    { label: t('lineProfile.route.shortName'), value: route_short_name },
    { label: t('lineProfile.route.start'), value: route_start },
    { label: t('lineProfile.route.end'), value: route_end },
    { label: t('lineProfile.route.mkt'), value: route_mkt },
    { label: t('lineProfile.route.direction'), value: route_direction },
    { label: t('lineProfile.route.type'), value: route_type },
    { label: t('lineProfile.route.alternative'), value: route_alternative },
  ]

  return (
    <InfoTable>
      {data.map(({ label, value }) => (
        <InfoItem key={`${label}-${value}`} lable={label} value={value} />
      ))}
    </InfoTable>
  )
}

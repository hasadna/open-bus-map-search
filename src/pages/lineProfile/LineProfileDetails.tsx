import React from 'react'
import './LineProfileDetails.scss'
import { Route } from './Route.interface'
import { useTranslation } from 'react-i18next'

type Props = Route

export const LineProfileDetails: React.FC<Props> = ({
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
}) => {
  const { t } = useTranslation()

  const [route_start, route_end] = route_long_name.split('<->')

  const data = [
    { label: t('lineProfile.id'), value: id },
    { label: t('lineProfile.date'), value: date },
    { label: t('lineProfile.lineReference'), value: line_ref },
    { label: t('lineProfile.operatorReference'), value: operator_ref },
    { label: t('lineProfile.agencyName'), value: agency_name },
    { label: t('lineProfile.route.shortName'), value: route_short_name },
    { label: t('lineProfile.route.start'), value: route_start },
    { label: t('lineProfile.route.end'), value: route_end },
    { label: t('lineProfile.route.mkt'), value: route_mkt },
    { label: t('lineProfile.route.direction'), value: route_direction },
    { label: t('lineProfile.route.type'), value: route_type },
    { label: t('lineProfile.route.alternative'), value: route_alternative },
  ]

  return (
    <table>
      <tbody>
        {data.map(({ label, value }) => (
          <tr key={`${label}-${value}`}>
            <td>
              <strong>{label}</strong>
            </td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

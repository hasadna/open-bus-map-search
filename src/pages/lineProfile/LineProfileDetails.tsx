import { MultipleStopOutlined } from '@mui/icons-material'
import { Grid, Typography } from '@mui/material'
import moment from 'moment'
import { GtfsRoutePydanticModel } from 'open-bus-stride-client'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { routeStartEnd } from '../components/utils/rotueUtils'
import Widget from 'src/shared/Widget'

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
  const { t } = useTranslation()
  const [route_start, route_end] = routeStartEnd(routeLongName)

  const routeTypes = {
    '0': t('operator.type.light_rail'),
    '2': t('operator.type.rail'),
    '3': t('operator.type.bus'),
    '5': operatorRef === 33 ? t('operator.type.cable_car') : t('operator.type.subway'),
    '8': t('operator.type.taxi'),
    '715': t('operator.type.flex'),
  }

  const diractionTypes = {
    '1': t('lineProfile.route.direction_forth'),
    '2': t('lineProfile.route.direction_back'),
    '3': t('lineProfile.route.direction_forth'),
  }

  return (
    <Widget>
      <Grid container alignItems="center" flexDirection="column">
        <img src={`../operators-logos/${operatorRef}.svg`} height={60} />
        <Typography variant="h6">{agencyName}</Typography>
        <Typography variant="h2" fontSize="28px" fontWeight="bold" margin="21.5px 0">
          {t('lineProfile.title')} {routeShortName}
        </Typography>

        <Grid
          container
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          marginBottom="2.5em">
          {route_start} <MultipleStopOutlined /> {route_end}
        </Grid>

        <InfoTable>
          <InfoItem lable={t('lineProfile.id')} value={id} />
          <InfoItem lable={t('lineProfile.date')} value={moment(date).format('DD-MM-YYYY')} />
          <InfoItem lable={t('lineProfile.lineReference')} value={lineRef} />
          <InfoItem
            lable={t('lineProfile.operatorReference')}
            value={<Link to={'/operator?operatorId=' + operatorRef}>{operatorRef}</Link>}
          />
          <InfoItem
            lable={t('lineProfile.agencyName')}
            value={<Link to={'/operator?operatorId=' + operatorRef}>{agencyName}</Link>}
          />
          <InfoItem lable={t('lineProfile.route.shortName')} value={routeShortName} />
          <InfoItem lable={t('lineProfile.route.start')} value={route_start} />
          <InfoItem lable={t('lineProfile.route.end')} value={route_end} />
          <InfoItem lable={t('lineProfile.route.mkt')} value={routeMkt} />
          <InfoItem
            lable={t('lineProfile.route.direction')}
            value={diractionTypes[routeDirection as keyof typeof diractionTypes] ?? routeDirection}
          />
          <InfoItem
            lable={t('lineProfile.route.type')}
            value={routeTypes[routeType as keyof typeof routeTypes] ?? routeType}
          />
          <InfoItem lable={t('lineProfile.route.alternative')} value={routeAlternative} />
        </InfoTable>
      </Grid>
    </Widget>
  )
}

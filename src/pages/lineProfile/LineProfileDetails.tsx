import { MultipleStopOutlined } from '@mui/icons-material'
import { Typography } from '@mui/material'
import moment from 'moment'
import { GtfsRoutePydanticModel } from 'open-bus-stride-client'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import styled from 'styled-components'
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

  return (
    <Widget>
      <OperatorCard>
        <img src={`../operators-logos/${operatorRef}.svg`} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {agencyName}
        </Typography>
      </OperatorCard>
      <HeaderContainer>
        <h2 className="title">
          {t('lineProfile.title')} {routeShortName}
        </h2>
        <div className="route-wrapper">
          {route_start} <MultipleStopOutlined /> {route_end}
        </div>
      </HeaderContainer>
      <TableContainer>
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
          <InfoItem lable={t('lineProfile.route.direction')} value={routeDirection} />
          <InfoItem lable={t('lineProfile.route.type')} value={routeType} />
          <InfoItem lable={t('lineProfile.route.alternative')} value={routeAlternative} />
        </InfoTable>
      </TableContainer>
    </Widget>
  )
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  .route-wrapper {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`

const OperatorCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  img {
    width: 60px;
    height: 60px;
  }
`

const TableContainer = styled.div`
  display: flex;
  justify-content: center;
`

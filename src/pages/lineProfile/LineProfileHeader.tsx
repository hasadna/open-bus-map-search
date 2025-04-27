import { MultipleStopOutlined } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { GtfsRoutePydanticModel } from 'open-bus-stride-client'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { routeStartEnd } from '../components/utils/rotueUtils'

const LineProfileHeader = ({
  operatorRef,
  agencyName,
  routeShortName,
  routeLongName,
}: GtfsRoutePydanticModel) => {
  const { t } = useTranslation()
  const [route_start, route_end] = routeStartEnd(routeLongName)

  return (
    <>
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
    </>
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
export default LineProfileHeader

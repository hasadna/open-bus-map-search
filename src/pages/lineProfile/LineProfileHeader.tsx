import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import { MultipleStopOutlined } from '@mui/icons-material'
import { routeStartEnd } from '../components/utils/rotueUtils'
import { Route } from './Route.interface'

const LineProfileHeader = ({
  operator_ref,
  agency_name,
  route_short_name,
  route_long_name,
}: Route) => {
  const { t } = useTranslation()
  const [route_start, route_end] = routeStartEnd(route_long_name)

  return (
    <>
      <OperatorCard>
        <img src={`../operators-logos/${operator_ref}.svg`} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {agency_name}
        </Typography>
      </OperatorCard>
      <HeaderContainer>
        <h2 className="title">
          {t('lineProfile.title')} {route_short_name}
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

import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import { MultipleStopOutlined } from '@mui/icons-material'
import { Route } from './Route.interface'

type Props = Route

const LineProfileHeader: React.FC<Props> = ({
  operator_ref,
  agency_name,
  route_short_name,
  route_long_name,
}) => {
  const { t } = useTranslation()
  const [firstRoute, secondRoute] = route_long_name.split('<->')
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
          {firstRoute} <MultipleStopOutlined /> {secondRoute}
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

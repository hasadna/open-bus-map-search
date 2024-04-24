import styled from 'styled-components'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2

import { Label } from './components/Label'
import { NotFound } from './components/NotFound'
import { PageContainer } from './components/PageContainer'

import { useTranslation } from 'react-i18next'

//API
import Widget from 'src/shared/Widget'
import { useLoaderData } from 'react-router-dom'
import { ProfileLineDetails } from './ProfileLineDetails'
import { MapWithLocationsAndPath } from './components/map-related/MapWithLocationsAndPath'
import { Typography } from '@mui/material'
import { MultipleStopOutlined } from '@mui/icons-material'

const Profile = () => {
  return (
    <>
      <GeneralDetailsAboutLine />
    </>
  )
}

const GeneralDetailsAboutLine = () => {
  return (
    <>
      <PageContainer className="line-data-container">
        <LineProfileComponent />
      </PageContainer>
    </>
  )
}

interface LineProfileHeaderProps {
  operator_ref: number
  agency_name: string
  route_short_name: string
  route_long_name: string
}
const LineProfileHeader = ({
  operator_ref,
  agency_name,
  route_short_name,
  route_long_name,
}: LineProfileHeaderProps) => {
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

const LineProfileComponent = () => {
  const { t } = useTranslation()
  const route = useLoaderData() as {
    // TODO: find better type definition
    agency_name: string
    route_short_name: string
    route_long_name: string
    operator_ref: number
    message?: string
  }

  if (route.message)
    return (
      <NotFound>
        <Widget>
          <h1>{t('lineProfile.notFound')}</h1>
          <pre>{route.message}</pre>
        </Widget>
      </NotFound>
    )

  return (
    <Grid xs={12} lg={6}>
      <Widget>
        <div>
          <LineProfileHeader {...route} />
          <ProfileLineDetails route={route} />
          <Label text="שעות פעילות" />
          {/* GET the earliest and the latest bus drive departure time for each day */}
          <TableStyle>
            <table className="time-table">
              <tr>
                <th></th>
                <th>יום ראשון</th>
                <th>יום שני</th>
                <th>יום שלישי</th>
                <th>יום רביעי</th>
                <th>יום חמישי</th>
                <th>יום שישי</th>
                <th>יום שבת</th>
              </tr>

              <tr>
                <td>אוטובוס ראשון</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              <tr>
                <td>אוטובוס אחרון</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </TableStyle>

          <Label text="הערות ועדכונים על הקו:" />
          <div></div>
        </div>
      </Widget>
      <LineProfileMapContainer>
        <MapWithLocationsAndPath positions={[]} plannedRouteStops={[]} />
      </LineProfileMapContainer>
    </Grid>
  )
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const TableStyle = styled.table`
  & th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  & th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: rgb(95, 91, 255);
    color: white;
  }
  & tr {
    font-size: 1.15em;
  }
  & tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  & table {
    border-collapse: collapse;
  }
`

const LineProfileMapContainer = styled.div`
  .map-info {
    height: 15rem;
  }
`

export default Profile

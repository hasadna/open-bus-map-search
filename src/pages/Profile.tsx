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
import { MapContainer } from 'react-leaflet'

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

const LineProfileComponent = () => {
  const { t } = useTranslation()
  const route = useLoaderData() as {
    // TODO: find better type definition
    agency_name: string
    route_short_name: string
    route_long_name: string
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
        <h2 className="title">{t('lineProfile.title')}</h2>
        <label> מפעיל: {route.agency_name} </label>
        <br></br>
        <label> מספר קו: {route.route_short_name} </label>
        <br></br>
        <label> כיוון נסיעה: {route.route_long_name} </label>
        <div>
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

import styled from 'styled-components'
import React from 'react'
// import { useContext, useState } from 'react'
import { useContext } from 'react'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import moment from 'moment'

import { Label } from './components/Label'
import { NotFound } from './components/NotFound'
import { PageContainer } from './components/PageContainer'

import { TEXTS } from 'src/resources/texts'
import { useTranslation } from 'react-i18next'
// import GapsPage from './GapsPage'
// import SingleLineMapPage from './SingleLineMapPage'
import { PageSearchState, SearchContext } from '../model/pageState'
import LineNumberSelector from './components/LineSelector'
import OperatorSelector from './components/OperatorSelector'
import RouteSelector from './components/RouteSelector'

//API
// import { /*getGtfsRidesList,*/ getRidesAsync } from 'src/api/profileService'
import { getRoutesAsync } from '../api/gtfsService'
import Widget from 'src/shared/Widget'

// time inputs
// import { DateSelector } from './components/DateSelector'
// import { TimeSelector } from './components/TimeSelector'
// import { useDate } from './components/DateTimePicker'

const Profile = () => {
  return (
    <>
      <GeneralDetailsAboutLine />
    </>
  )
}

const GeneralDetailsAboutLine = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, routes, routeKey } = search

  return (
    <>
      <PageContainer className="line-data-container">
        {/* choose operator */}
        <Grid xs={8}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>

        {/* choose line number */}
        <Grid xs={8}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>

        {/* choose route*/}
        <Grid xs={12}>
          {routes &&
            (routes.length === 0 ? (
              <NotFound>{TEXTS.line_not_found}</NotFound>
            ) : (
              <RouteSelector
                routes={routes}
                routeKey={routeKey}
                setRouteKey={(key) => setSearch((current) => ({ ...current, routeKey: key }))}
              />
            ))}
        </Grid>

        <LineProfileComponent search={search} />
      </PageContainer>
    </>
  )
}

const LineProfileComponent = ({ search }: { search: PageSearchState }) => {
  const { t } = useTranslation()

  // const resp = getRidesAsync(search.operatorId, search.lineNumber, search.routeKey, new Date())
  // const resp = getGtfsRidesList(new Date(), '3', '271', '1')
  const resp = getRoutesAsync(
    moment(search.timestamp),
    moment(search.timestamp),
    search.operatorId,
    search.lineNumber,
  )

  return (
    <Grid xs={12} lg={6}>
      <Widget>
        <h2 className="title">{t('profile_page')}</h2>
        <label> מפעיל: {search.operatorId} </label>
        <br></br>
        <label> מספר קו: {search.lineNumber} </label>
        <br></br>
        <label> כיוון נסיעה: {search.routeKey} </label>
        <div>
          <div>{resp.toString()}</div>
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

export default Profile

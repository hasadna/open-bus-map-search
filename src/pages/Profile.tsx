import styled from 'styled-components'
import React from 'react'
import { useContext, useState } from 'react'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2

import { Label } from './components/Label'
import { NotFound } from './components/NotFound'
import { PageContainer } from './components/PageContainer'

import { TEXTS } from 'src/resources/texts'
import { useTranslation } from 'react-i18next'
// import GapsPage from './GapsPage'
// import SingleLineMapPage from './SingleLineMapPage'
import { SearchContext } from '../model/pageState'
import LineNumberSelector from './components/LineSelector'
import OperatorSelector from './components/OperatorSelector'
import RouteSelector from './components/RouteSelector'

//API
import { getGtfsRidesList } from 'src/api/gtfsService'

// time inputs
import { DateSelector } from './components/DateSelector'
import { TimeSelector } from './components/TimeSelector'
import moment from 'moment'
import { useDate } from './components/DateTimePicker'

// GRAPH
import { GroupByRes, useGroupBy } from 'src/api/groupByService'
import BusArrivalTimeline from './components/BusArrivalsTimeline'
// import { json } from 'stream/consumers'

const Profile = () => {
  return (
    <>
      <GeneralDetailsAboutLine />
      <LineGraphSchedule />
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

        <LineProfileComponent />
      </PageContainer>
    </>
  )
}

const LineProfileComponent = () => {
  const { t } = useTranslation()
  // const { search, setSearch } = useContext(SearchContext)
  // const { operatorId, lineNumber, timestamp, routes, routeKey } = search

  // const resp = getGtfsRidesList(new Date(), operator, lineNumber, routeId)
  const resp = getGtfsRidesList(new Date(), '3', '271', '1')

  return (
    <Grid xs={12} lg={6}>
      <div className="widget">
        <h2 className="title">{t('profile_page')}</h2>
        {/* <label> מפעיל: {operator} </label>
        <label> מספר קו: {line} </label>
        <label> כיוון נסיעה: {route} </label> */}
        <div>
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
      </div>
    </Grid>
  )
}

const convertToProfileGraphStruct = (arr: GroupByRes[]) => {
  return arr.map((item: GroupByRes) => ({
    id: item.operator_ref?.agency_id || 'Unknown',
    name: item.operator_ref?.agency_name || 'Unknown',

    current: item.total_actual_rides,
    max: item.total_planned_rides,
    percent: (item.total_actual_rides / item.total_planned_rides) * 100,
    gtfs_route_date: item.gtfs_route_date,
    gtfs_route_hour: item.gtfs_route_hour,
  }))
}

// const LineUpdateParagraph =

const LineGraphSchedule = () => {
  /*
  DATA NEEDED:
  - inputs which indicate the timestamp
  - schedule of the bus line
  - timestamp and location of the bus in real time or historically accroding
  - arrange in series and
  - present in graph 
  */
  const fiveMinutesAgo = moment().subtract(5, 'minutes')
  const fourMinutesAgo = fiveMinutesAgo.add(1, 'minutes')

  const [from, setFrom] = useState(fiveMinutesAgo)
  const [to, setTo] = useState(fourMinutesAgo)
  const now = moment()

  const [startDate, setStartDate] = useDate(now.clone().subtract(7, 'days'))
  const [endDate, setEndDate] = useDate(now.clone().subtract(1, 'day'))
  const [groupByHour, setGroupByHour] = React.useState<boolean>(false)

  const [graphData, loadingGrap] = useGroupBy({
    dateTo: endDate,
    dateFrom: startDate,
    groupBy: groupByHour ? 'operator_ref,gtfs_route_hour' : 'operator_ref,gtfs_route_date',
  })

  return (
    <>
      {/* from date */}
      <Grid xs={2}>
        <Label text={TEXTS.from_date} />
      </Grid>
      <Grid xs={5}>
        <DateSelector
          time={to}
          onChange={(ts) => {
            const val = ts ? ts : to
            setFrom(moment(val).subtract(moment(to).diff(moment(from)))) // keep the same time difference
            setTo(moment(val))
          }}
        />
      </Grid>
      <Grid xs={5}>
        <TimeSelector
          time={to}
          onChange={(ts) => {
            const val = ts ? ts : from
            setFrom(moment(val))
            setTo(moment(val).add(moment(to).diff(moment(from)))) // keep the same time difference
          }}
        />
      </Grid>

      <Grid xs={12}>
        <div className="widget">
          <h2 className="title">{TEXTS.profile_page_line}</h2>
          <BusArrivalTimeline data={convertToProfileGraphStruct(graphData)} />
        </div>
      </Grid>
    </>
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

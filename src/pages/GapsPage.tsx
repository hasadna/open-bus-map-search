import React, { useContext, useEffect, useState } from 'react'
import { PageContainer } from './components/PageContainer'
import { Row } from './components/Row'
import { Label } from './components/Label'
import { TEXTS } from '../resources/texts'
import OperatorSelector from './components/OperatorSelector'
import LineNumberSelector from './components/LineSelector'
import { SearchContext } from '../model/pageState'
import { Gap, GapsList } from '../model/gaps'
import { getGapsAsync } from '../api/gapsService'
import { Spin } from 'antd'
import RouteSelector from './components/RouteSelector'
import { NotFound } from './components/NotFound'
import { getRoutesAsync } from '../api/gtfsService'
import moment, { Moment } from 'moment'
import styled from 'styled-components'
import { useSessionStorage } from 'usehooks-ts'
import { DateSelector } from './components/DateSelector'
import { FormControlLabel, Switch } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import { INPUT_SIZE } from 'src/resources/sizes'

function formatTime(time: Moment) {
  return time.format(TEXTS.time_format)
}

function formatStatus(all: GapsList, gap: Gap) {
  if (!gap.siriTime) {
    return TEXTS.ride_missing
  }
  if (gap.gtfsTime) {
    return TEXTS.ride_as_planned
  }
  const hasTwinRide = all.some((g) => g.gtfsTime && g.siriTime && g.siriTime.isSame(gap.siriTime))
  if (hasTwinRide) {
    return TEXTS.ride_duped
  }
  return TEXTS.ride_extra
}

const Cell = styled.div`
  width: 120px;
`

const TitleCell = styled(Cell)`
  font-weight: bold;
`

const GapsPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [gaps, setGaps] = useState<GapsList>()

  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const [gapsIsLoading, setGapsIsLoading] = useState(false)
  const [onlyGapped, setOnlyGapped] = useSessionStorage('onlyGapped', false)

  useEffect(() => {
    if (operatorId && routes && routeKey && timestamp) {
      const selectedRoute = routes.find((route) => route.key === routeKey)
      if (!selectedRoute) {
        return
      }
      setGapsIsLoading(true)
      getGapsAsync(moment(timestamp), operatorId, selectedRoute.lineRef)
        .then(setGaps)
        .finally(() => setGapsIsLoading(false))
    }
  }, [operatorId, routeKey, timestamp])

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      return
    }
    getRoutesAsync(moment(timestamp), operatorId, lineNumber)
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .finally(() => setRoutesIsLoading(false))
  }, [operatorId, lineNumber, timestamp, setSearch])

  return (
    <PageContainer>
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        {/* choose date */}
        <Grid xs={4}>
          <Label text={TEXTS.choose_date} />
        </Grid>
        <Grid xs={8}>
          <DateSelector
            timeValid={moment(timestamp)}
            setTimeValid={(ts) =>
              setSearch((current) => ({ ...current, timestamp: ts ? ts.valueOf() : 0 }))
            }
          />
        </Grid>
        {/* choose operator */}
        <Grid xs={4}>
          <Label text={TEXTS.choose_operator} />
        </Grid>
        <Grid xs={8}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        {/* choose line */}
        <Grid xs={4}>
          <Label text={TEXTS.choose_line} />
        </Grid>
        <Grid xs={8}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>
        {/* choose routes */}
        <Grid xs={12}>
          {routesIsLoading && (
            <Row>
              <Label text={TEXTS.loading_routes} />
              <Spin />
            </Row>
          )}
          {!routesIsLoading &&
            routes &&
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
        <Grid xs={12}>
          {gapsIsLoading && (
            <Row>
              <Label text={TEXTS.loading_gaps} />
              <Spin />
            </Row>
          )}
        </Grid>
      </Grid>
      {!gapsIsLoading && routeKey && (
        <>
          <FormControlLabel
            control={
              <Switch checked={onlyGapped} onChange={(e) => setOnlyGapped(e.target.checked)} />
            }
            label={TEXTS.checkbox_only_gaps}
          />
          <Row>
            <TitleCell>{TEXTS.planned_time}</TitleCell>
            <TitleCell>{TEXTS.planned_status}</TitleCell>
          </Row>
          {gaps
            ?.filter((gap) => gap.gtfsTime || gap.siriTime)
            .filter((gap) => !onlyGapped || !gap.gtfsTime || !gap.siriTime)
            .map((gap, i) => (
              <Row key={i}>
                <Cell>{formatTime(gap.gtfsTime || gap.siriTime || moment())}</Cell>
                <Cell>{formatStatus(gaps, gap)}</Cell>
              </Row>
            ))}
        </>
      )}
    </PageContainer>
  )
}

export default GapsPage

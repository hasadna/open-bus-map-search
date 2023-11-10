import { useContext, useEffect, useState } from 'react'
import { PageContainer } from './components/PageContainer'
import { Row } from './components/Row'
import { Label } from './components/Label'
import { useTranslation } from 'react-i18next'
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
import DisplayGapsPercentage from './components/DisplayGapsPercentage'

function formatTime(time: Moment) {
  return time.format(t('time_format'))
}

function formatStatus(all: GapsList, gap: Gap) {
  if (!gap.siriTime) {
    return t('ride_missing')
  }
  if (gap.gtfsTime) {
    return t('ride_as_planned')
  }
  const hasTwinRide = all.some((g) => g.gtfsTime && g.siriTime && g.siriTime.isSame(gap.siriTime))
  if (hasTwinRide) {
    return t('ride_duped')
  }
  return t('ride_extra')
}

function getGapsPercentage(gaps: GapsList | undefined): number | undefined {
  const ridesInTime = gaps?.filter((gap) => formatStatus([], gap) === t('ride_as_planned'))
  if (!gaps || !ridesInTime) return undefined
  const ridesInTimePercentage = (ridesInTime?.length / gaps?.length) * 100
  const allRidesPercentage = 100
  return allRidesPercentage - ridesInTimePercentage
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
      getGapsAsync(moment(timestamp), moment(timestamp), operatorId, selectedRoute.lineRef)
        .then(setGaps)
        .finally(() => setGapsIsLoading(false))
    }
  }, [operatorId, routeKey, timestamp])

  useEffect(() => {
    if (!operatorId || operatorId === '0' || !lineNumber) {
      setSearch((current) => ({
        ...current,
        routes: undefined,
        routeKey: undefined,
      }))
      return
    }
    getRoutesAsync(moment(timestamp), moment(timestamp), operatorId, lineNumber)
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .finally(() => setRoutesIsLoading(false))
  }, [operatorId, lineNumber, timestamp, setSearch])

  const gapsPercentage = getGapsPercentage(gaps)

  const { t } = useTranslation()

  return (
    <PageContainer>
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        {/* choose date */}
        <Grid xs={4}>
          <Label text={t('choose_date')} />
        </Grid>
        <Grid xs={8}>
          <DateSelector
            time={moment(timestamp)}
            onChange={(ts) =>
              setSearch((current) => ({ ...current, timestamp: ts ? ts.valueOf() : 0 }))
            }
          />
        </Grid>
        {/* choose operator */}
        <Grid xs={4}>
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid xs={8}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        {/* choose line */}
        <Grid xs={4}>
          <Label text={t('choose_line')} />
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
              <Label text={t('loading_routes')} />
              <Spin />
            </Row>
          )}
          {!routesIsLoading &&
            routes &&
            (routes.length === 0 ? (
              <NotFound>{t('line_not_found')}</NotFound>
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
              <Label text={t('loading_gaps')} />
              <Spin />
            </Row>
          )}
        </Grid>
      </Grid>
      {!gapsIsLoading && routeKey && routeKey !== '0' && (
        <>
          <FormControlLabel
            control={
              <Switch checked={onlyGapped} onChange={(e) => setOnlyGapped(e.target.checked)} />
            }
            label={t('checkbox_only_gaps')}
          />
          <DisplayGapsPercentage
            gapsPercentage={gapsPercentage}
            decentPercentage={5}
            terriblePercentage={20}
          />
          <Row>
            <TitleCell>{t('planned_time')}</TitleCell>
            <TitleCell>{t('planned_status')}</TitleCell>
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

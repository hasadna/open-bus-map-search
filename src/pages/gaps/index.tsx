import { Alert, CircularProgress, FormControlLabel, Grid, Switch, Typography } from '@mui/material'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useSessionStorage } from 'usehooks-ts'
import { getGapsAsync } from '../../api/gapsService'
import { getGtfsRoutes } from '../../api/gtfsService'
import { Gap, GapsList } from '../../model/gaps'
import { SearchContext } from '../../model/pageState'
import { DateSelector } from '../components/DateSelector'
import DisplayGapsPercentage from '../components/DisplayGapsPercentage'
import { Label } from '../components/Label'
import LineNumberSelector from '../components/LineSelector'
import { NotFound } from '../components/NotFound'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import RouteSelector from '../components/RouteSelector'
import { Row } from '../components/Row'
import { INPUT_SIZE } from 'src/resources/sizes'
import dayjs from 'src/dayjs'

const Cell = styled.div`
  width: 120px;
`

const TitleCell = styled(Cell)`
  font-weight: bold;
`

const GapsPage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [gaps, setGaps] = useState<GapsList>()
  const [routesIsLoading, setRoutesIsLoading] = useState(false)
  const [gapsIsLoading, setGapsIsLoading] = useState(false)
  const [onlyGapped, setOnlyGapped] = useSessionStorage('onlyGapped', false)

  function formatTime(time: dayjs.Dayjs) {
    return time.format(t('time_format'))
  }

  function formatStatus(all: GapsList, gap: Gap) {
    const gapTime = gap.gtfsTime || gap.siriTime
    if (gapTime && gapTime.isAfter(dayjs())) {
      return t('ride_in_future')
    }
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
    if (!gaps) return undefined
    const relevantGaps = gaps.filter((gap) => {
      const gapTime = gap.gtfsTime || gap.siriTime
      return gapTime && gapTime.isBefore(dayjs())
    })
    if (relevantGaps.length === 0) return undefined
    const ridesInTime = relevantGaps.filter(
      (gap) => formatStatus(gaps, gap) === t('ride_as_planned'),
    )
    const ridesInTimePercentage = (ridesInTime.length / relevantGaps.length) * 100
    const allRidesPercentage = 100
    return allRidesPercentage - ridesInTimePercentage
  }

  useEffect(() => {
    const source = axios.CancelToken.source()
    if (operatorId && routes && routeKey && timestamp) {
      const selectedRoute = routes.find((route) => route.key === routeKey)
      if (!selectedRoute) {
        return
      }
      setGapsIsLoading(true)
      getGapsAsync(
        dayjs(timestamp),
        dayjs(timestamp),
        operatorId,
        selectedRoute.lineRef,
        source.token,
      )
        .then(setGaps)
        .catch((err) => console.error(err.message))
        .finally(() => setGapsIsLoading(false))
    }
    return () => source.cancel()
  }, [operatorId, routeKey, timestamp])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    if (!operatorId || operatorId === '0' || !lineNumber) {
      setSearch((current) => ({
        ...current,
        routes: undefined,
        routeKey: undefined,
      }))
      return
    }
    setRoutesIsLoading(true)
    getGtfsRoutes({
      from: timestamp,
      operatorId,
      routeShortName: lineNumber,
      signal,
      toBusRoute: true,
    })
      .then((routes) =>
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: routes } : current,
        ),
      )
      .catch((err) => console.error(err.message))
      .finally(() => setRoutesIsLoading(false))
    return () => controller.abort()
  }, [operatorId, lineNumber, timestamp, setSearch])

  const gapsPercentage = getGapsPercentage(gaps)

  return (
    <PageContainer>
      <Typography className="page-title" variant="h4">
        {t('gaps_page_title')}
      </Typography>
      <Alert severity="info" variant="outlined" icon={false}>
        {t('gaps_page_description')}
      </Alert>
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE }}>
        {/* choose date */}
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_date')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <DateSelector
            time={dayjs(timestamp)}
            onChange={(ts) =>
              setSearch((current) => ({ ...current, timestamp: ts ? ts.valueOf() : 0 }))
            }
          />
        </Grid>
        {/* choose operator */}
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        {/* choose line */}
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_line')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>
        {/* choose routes */}
        <Grid size={{ xs: 12 }}>
          {routesIsLoading && (
            <Row>
              <Label text={t('loading_routes')} />
              <CircularProgress />
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
        <Grid size={{ xs: 12 }}>
          {gapsIsLoading && (
            <Row>
              <Label text={t('loading_gaps')} />
              <CircularProgress />
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
            .filter((gap) => !onlyGapped || !(gap.gtfsTime || gap.siriTime)?.isAfter(dayjs()))
            .sort((t1, t2) => {
              return Number((t1?.siriTime || t1?.gtfsTime)?.diff(t2?.siriTime || t2?.gtfsTime))
            })
            .map((gap, i) => (
              <Row key={i}>
                <Cell>{formatTime(gap.gtfsTime || gap.siriTime || dayjs())}</Cell>
                <Cell>{formatStatus(gaps, gap)}</Cell>
              </Row>
            ))}
        </>
      )}
    </PageContainer>
  )
}

export default GapsPage

import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import styled from 'styled-components'
import { useSessionStorage } from 'usehooks-ts'
import { Alert, Typography, CircularProgress, Grid, FormControlLabel, Switch } from '@mui/material'
import axios from 'axios'
import { PageContainer } from '../components/PageContainer'
import { Row } from '../components/Row'
import { Label } from '../components/Label'
import OperatorSelector from '../components/OperatorSelector'
import LineNumberSelector from '../components/LineSelector'
import { SearchContext } from '../../model/pageState'
import { Gap, GapsList } from '../../model/gaps'
import { getGapsAsync } from '../../api/gapsService'
import RouteSelector from '../components/RouteSelector'
import { NotFound } from '../components/NotFound'
import { getRoutesAsync } from '../../api/gtfsService'
import { DateSelector } from '../components/DateSelector'
import DisplayGapsPercentage from '../components/DisplayGapsPercentage'
import { INPUT_SIZE } from 'src/resources/sizes'

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
    getRoutesAsync(dayjs(timestamp), dayjs(timestamp), operatorId, lineNumber, signal)
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

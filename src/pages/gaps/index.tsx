import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { formatIsraelDate, getServiceDayTimeBounds, parseIsraelDate } from 'src/dayjs'
import { GlobalSearchContext } from 'src/model/globalState'
import { INPUT_SIZE } from 'src/resources/sizes'
import { Gap, getGapsAsync } from '../../api/gapsService'
import { getServiceDayRoutes } from '../../api/serviceDayRoutesService'
import { BusRoute } from '../../model/busRoute'
import { DateSelector } from '../components/DateSelector'
import { Label } from '../components/Label'
import LineNumberSelector from '../components/LineSelector'
import { NotFound } from '../components/NotFound'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import RouteSelector from '../components/RouteSelector'
import { Row } from '../components/Row'
import GapsTable from './GapsTable'

const GapsPage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(GlobalSearchContext)
  const { operatorId, lineNumber, date, routeKey } = search
  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [gaps, setGaps] = useState<Gap[]>()
  const [gapsIsLoading, setGapsIsLoading] = useState(false)

  const singleLineMapBaseHref = useMemo(() => {
    const params = new URLSearchParams()
    params.set('date', search.date || '')
    params.set('operatorId', search.operatorId || '')
    params.set('lineNumber', search.lineNumber || '')
    params.set('routeKey', search.routeKey || '')
    return `/single-line-map?${params.toString()}`
  }, [search.date, search.lineNumber, search.operatorId, search.routeKey])

  useEffect(() => {
    if (!(operatorId && routes && routeKey && date)) return
    const selectedRoute = routes.find((route) => route.key === routeKey)
    if (!selectedRoute) return

    setGapsIsLoading(true)
    const { start, end } = getServiceDayTimeBounds(date)
    getGapsAsync(start, end, operatorId, selectedRoute.lineRef)
      .then((res) =>
        setGaps(
          res.filter((g) => {
            const t = g.plannedStartTime || g.actualStartTime
            if (!t) return false
            // date_from already excludes pre-service-day rides, so one slipping through
            // means the API's date filtering regressed. Keep it off-screen, but scream
            // about it instead of silently masking the upstream bug.
            if (t.isBefore(start)) {
              console.error('gaps: ride before service-day start, dropping', {
                rideStart: t.toISOString(),
                serviceDayStart: start.toISOString(),
                gap: g,
              })
              return false
            }
            // Upper bound is real semantics, not masking: the date-only API over-fetches
            // all of tomorrow, and this trims it back to the 04:00 service-day cutoff.
            return t.isBefore(end)
          }),
        ),
      )
      .catch((err) => {
        console.error('Failed to fetch gaps:', err.message)
        setGaps(undefined)
      })
      .finally(() => setGapsIsLoading(false))
  }, [operatorId, routes, routeKey, date])

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      return
    }

    const controller = new AbortController()

    getServiceDayRoutes(date, operatorId, lineNumber, controller.signal)
      .then((fetchedRoutes) => {
        if (search.lineNumber === lineNumber) {
          setRoutes(fetchedRoutes)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch routes:', err.message)
      })

    return () => controller.abort()
  }, [operatorId, lineNumber, date, setSearch])

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    if (!time) return
    setSearch((current) => ({
      ...current,
      date: formatIsraelDate(time),
    }))
  }

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId }))
  }

  const handleLineNumberChange = (lineNumber: string) => {
    setSearch((current) =>
      lineNumber === current.lineNumber
        ? { ...current }
        : { ...current, lineNumber, routeKey: null },
    )
    if (lineNumber !== search.lineNumber) {
      setRoutes(undefined)
    }
  }

  const handleRouteKeyChange = (routeKey?: string) => {
    setSearch((current) => ({ ...current, routeKey: routeKey ?? null }))
  }

  // On gap row click: only set rideTime — date stays as the service day the
  // user was browsing. rideTime uses 24+ hour format for past-midnight rides
  // (e.g. "25:30") so single-line-map can reconstruct the correct time.
  const handleStartTimeClick = useCallback(
    (rideTime: string) => {
      setSearch((current) => ({ ...current, rideTime }))
    },
    [setSearch],
  )

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
          <DateSelector time={parseIsraelDate(date)} onChange={handleDateChange} />
        </Grid>
        {/* choose operator */}
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <OperatorSelector
            operatorId={operatorId ?? undefined}
            setOperatorId={handleOperatorChange}
          />
        </Grid>
        {/* choose line */}
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_line')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <LineNumberSelector
            lineNumber={lineNumber ?? undefined}
            setLineNumber={handleLineNumberChange}
          />
        </Grid>
        {/* choose routes */}
        <Grid size={{ xs: 12 }}>
          {routes?.length === 0 ? (
            <NotFound>{t('line_not_found')}</NotFound>
          ) : (
            <RouteSelector
              routes={routes || []}
              disabled={!routes}
              routeKey={routeKey ?? undefined}
              setRouteKey={handleRouteKeyChange}
            />
          )}
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
      {routeKey && routeKey !== '' && (
        <GapsTable
          loading={gapsIsLoading}
          gaps={gaps}
          date={date}
          singleLineMapBaseHref={singleLineMapBaseHref}
          onStartTimeClick={handleStartTimeClick}
        />
      )}
    </PageContainer>
  )
}

export default GapsPage

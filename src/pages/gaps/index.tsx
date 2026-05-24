import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { usePageState } from 'src/hooks/usePageState'
import { INPUT_SIZE } from 'src/resources/sizes'
import { Gap, getGapsAsync } from '../../api/gapsService'
import { getServiceDayRoutes } from '../../api/serviceDayRoutesService'
import { BusRoute } from '../../model/busRoute'
import { SearchContext } from '../../model/pageState'
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
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, date, routeKey } = search

  // Routes are page-local: they are fetched from the API and used only
  // within this page to populate the RouteSelector and find the selected
  // route for the gaps query. Storing them in global state was unnecessary.
  const [routes, setRoutes] = useState<BusRoute[] | undefined>()
  const [gaps, setGaps] = useState<Gap[]>()
  const [gapsIsLoading, setGapsIsLoading] = useState(false)

  // Scroll position persisted so the user can return to their position after
  // navigating to /single-line-map (via gap row click) and pressing back.
  usePageState('gaps', { params: {}, ui: { scrollPosition: 0 } })

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
    const start = dayjs.tz(date, ISRAEL_TIMEZONE).startOf('day')
    const end = start.add(1, 'day').add(4, 'h')
    getGapsAsync(start.valueOf(), end.valueOf(), operatorId, selectedRoute.lineRef)
      .then((res) =>
        setGaps(
          res.filter((g) => {
            const t = g.plannedStartTime || g.actualStartTime
            return t && !t.isBefore(start) && t.isBefore(end)
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

    getServiceDayRoutes(dayjs.tz(date, ISRAEL_TIMEZONE), operatorId, lineNumber, controller.signal)
      .then((fetchedRoutes) => {
        if (search.lineNumber === lineNumber) {
          setRoutes(fetchedRoutes)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch routes:', err.message)
      })

    return () => controller.abort()
  }, [operatorId, lineNumber, date])

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({
      ...current,
      date: time?.format('YYYY-MM-DD') ?? toIsraelTimezone(dayjs()).format('YYYY-MM-DD'),
    }))
  }

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId }))
  }

  const handleLineNumberChange = (lineNumber: string) => {
    setSearch((current) =>
      lineNumber === current.lineNumber ? current : { ...current, lineNumber, routeKey: null },
    )
    setRoutes(undefined)
  }

  const handleRouteKeyChange = (routeKey?: string) => {
    setSearch((current) => ({ ...current, routeKey: routeKey ?? null }))
  }

  // On gap row click: only set rideTime — date stays as the service day the
  // user was browsing. rideTime uses 24+ hour format for past-midnight rides
  // (e.g. "25:30") so single-line-map can reconstruct the correct timestamp.
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
          <DateSelector time={dayjs.tz(date, ISRAEL_TIMEZONE)} onChange={handleDateChange} />
        </Grid>
        {/* choose operator */}
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_operator')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <OperatorSelector operatorId={operatorId} setOperatorId={handleOperatorChange} />
        </Grid>
        {/* choose line */}
        <Grid size={{ xs: 4 }}>
          <Label text={t('choose_line')} />
        </Grid>
        <Grid size={{ xs: 8 }}>
          <LineNumberSelector lineNumber={lineNumber} setLineNumber={handleLineNumberChange} />
        </Grid>
        {/* choose routes */}
        <Grid size={{ xs: 12 }}>
          {routes?.length === 0 ? (
            <NotFound>{t('line_not_found')}</NotFound>
          ) : (
            <RouteSelector
              routes={routes || []}
              disabled={!routes}
              routeKey={routeKey}
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

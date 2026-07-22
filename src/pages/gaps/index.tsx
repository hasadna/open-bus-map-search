import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'
import { usePageState } from 'src/hooks/usePageState'
import { GlobalSearchContext } from 'src/model/globalState'
import { INPUT_SIZE } from 'src/resources/sizes'
import { getGapsAsync, SerializedGap, serializeGap } from '../../api/gapsService'
import { getServiceDayRoutes } from '../../api/serviceDayRoutesService'
import { DateSelector } from '../components/DateSelector'
import { Label } from '../components/Label'
import LineNumberSelector from '../components/LineSelector'
import { NotFound } from '../components/NotFound'
import OperatorSelector from '../components/OperatorSelector'
import { PageContainer } from '../components/PageContainer'
import RouteSelector from '../components/RouteSelector'
import { Row } from '../components/Row'
import { serviceDayBounds } from '../components/utils/startTimeUtils'
import GapsTable from './GapsTable'

const GapsPage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(GlobalSearchContext)
  const { operatorId, lineNumber, date, routeKey } = search

  // scrollPosition (auto-restored by usePageState) and the "only gaps" toggle are
  // device-local UI state, kept out of the shareable params.
  const { ui, setUi } = usePageState('gaps', {
    params: {},
    ui: { scrollPosition: 0, gapsOnly: false },
  })

  const singleLineMapBaseHref = useMemo(() => {
    const params = new URLSearchParams()
    params.set('date', search.date || '')
    params.set('operatorId', search.operatorId || '')
    params.set('lineNumber', search.lineNumber || '')
    params.set('routeKey', search.routeKey || '')
    return `/single-line-map?${params.toString()}`
  }, [search.date, search.lineNumber, search.operatorId, search.routeKey])

  const routesQuery = useQuery({
    queryFn: ({ signal }) => {
      if (!operatorId || !lineNumber) return null
      return getServiceDayRoutes(dayjs.tz(date, ISRAEL_TIMEZONE), operatorId, lineNumber, signal)
    },
    queryKey: ['gapsRoutes', operatorId, lineNumber, date],
  })
  const routes = routesQuery.data ?? undefined

  const selectedRoute = useMemo(
    () => routes?.find((route) => route.key === routeKey),
    [routes, routeKey],
  )

  const gapsQuery = useQuery({
    queryFn: async (): Promise<SerializedGap[] | null> => {
      if (!operatorId || !selectedRoute || !date) return null
      const { start, end } = serviceDayBounds(date)
      const res = await getGapsAsync(start, end, operatorId, selectedRoute.lineRef)
      return (
        res
          .filter((g) => {
            const gapTime = g.plannedStartTime || g.actualStartTime
            return gapTime && !gapTime.isBefore(start) && gapTime.isBefore(end)
          })
          // Store JSON-serializable strings, not dayjs, so the persisted cache
          // rehydrates losslessly; GapsTable revives them to dayjs on read.
          .map(serializeGap)
      )
    },
    queryKey: ['gaps', operatorId, selectedRoute?.lineRef, date],
  })
  const gaps = gapsQuery.data ?? undefined

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    if (!time) return
    setSearch((current) => ({
      ...current,
      date: time.format('YYYY-MM-DD'),
    }))
  }

  const handleOperatorChange = (operatorId: string) => {
    // Changing/clearing the operator invalidates the chosen route (routes are
    // per operator+line), so reset it to close the stale results table.
    setSearch((current) => ({ ...current, operatorId, routeKey: null }))
  }

  const handleLineNumberChange = (lineNumber: string) => {
    setSearch((current) =>
      lineNumber === current.lineNumber
        ? { ...current }
        : { ...current, lineNumber, routeKey: null },
    )
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
      <Grid container spacing={2} sx={{ maxWidth: INPUT_SIZE, width: '100%', mx: 'auto' }}>
        {/* choose date */}
        <Grid size={{ sm: 6, xs: 12 }}>
          <DateSelector time={dayjs.tz(date, ISRAEL_TIMEZONE)} onChange={handleDateChange} />
        </Grid>
        {/* choose operator */}
        <Grid size={{ sm: 6, xs: 12 }}>
          <OperatorSelector
            operatorId={operatorId ?? undefined}
            setOperatorId={handleOperatorChange}
            excludeIsraelRailways
          />
        </Grid>
        {/* choose line */}
        <Grid size={{ sm: 6, xs: 12 }}>
          <LineNumberSelector
            disabled={!operatorId}
            lineNumber={lineNumber ?? undefined}
            setLineNumber={handleLineNumberChange}
          />
        </Grid>
        {/* choose route */}
        <Grid size={{ sm: 6, xs: 12 }}>
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
        {gapsQuery.isLoading && (
          <Grid size={{ xs: 12 }}>
            <Row>
              <Label text={t('loading_gaps')} />
              <CircularProgress />
            </Row>
          </Grid>
        )}
      </Grid>
      {selectedRoute && (
        <GapsTable
          loading={gapsQuery.isLoading}
          gaps={gaps}
          date={date}
          singleLineMapBaseHref={singleLineMapBaseHref}
          onStartTimeClick={handleStartTimeClick}
          onlyGapped={ui.gapsOnly}
          onOnlyGappedChange={(value) => setUi((prev) => ({ ...prev, gapsOnly: value }))}
        />
      )}
    </PageContainer>
  )
}

export default GapsPage

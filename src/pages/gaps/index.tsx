import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Gap, getGapsAsync } from '../../api/gapsService'
import { getGtfsRoutes } from '../../api/gtfsService'
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
import dayjs from 'src/dayjs'
import { INPUT_SIZE } from 'src/resources/sizes'

const GapsPage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routes, routeKey } = search
  const [gaps, setGaps] = useState<Gap[]>()
  const [gapsIsLoading, setGapsIsLoading] = useState(false)

  useEffect(() => {
    if (!(operatorId && routes && routeKey && timestamp)) return
    const selectedRoute = routes.find((route) => route.key === routeKey)
    if (!selectedRoute) return

    setGapsIsLoading(true)
    getGapsAsync(timestamp, timestamp, operatorId, selectedRoute.lineRef)
      .then(setGaps)
      .catch((err) => {
        console.error('Failed to fetch gaps:', err.message)
        setGaps(undefined)
      })
      .finally(() => setGapsIsLoading(false))
  }, [operatorId, routes, routeKey, timestamp])

  useEffect(() => {
    if (!operatorId || !lineNumber) {
      return
    }

    const controller = new AbortController()
    getGtfsRoutes({
      from: timestamp,
      operatorId,
      routeShortName: lineNumber,
      toBusRoute: true,
      signal: controller.signal,
    })
      .then((fetchedRoutes) => {
        setSearch((current) =>
          search.lineNumber === lineNumber ? { ...current, routes: fetchedRoutes } : current,
        )
      })
      .catch((err) => {
        console.error('Failed to fetch routes:', err.message)
      })

    return () => controller.abort()
  }, [operatorId, lineNumber, timestamp, setSearch])

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? Date.now() }))
  }

  const handleOperatorChange = (operatorId: string) => {
    setSearch((current) => ({ ...current, operatorId }))
  }

  const handleLineNumberChange = (lineNumber: string) => {
    setSearch((current) =>
      lineNumber === current.lineNumber
        ? { ...current }
        : { ...current, lineNumber, routes: undefined, routeKey: undefined },
    )
  }

  const handleRouteKeyChange = (routeKey?: string) => {
    setSearch((current) => ({ ...current, routeKey }))
  }

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
          <DateSelector time={dayjs(timestamp)} onChange={handleTimestampChange} />
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
      {routeKey && routeKey !== '' && <GapsTable loading={gapsIsLoading} gaps={gaps} />}
    </PageContainer>
  )
}

export default GapsPage

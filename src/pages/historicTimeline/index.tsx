import { Alert, CircularProgress, Grid, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import {
  getGtfsStopHitTimesAsync,
  getRoutesAsync,
  getStopsForRouteAsync,
} from 'src/api/gtfsService'
import { getSiriStopHitTimesAsync } from 'src/api/siriService'
import dayjs from 'src/dayjs'
import { Label } from 'src/pages/components/Label'
import LineNumberSelector from 'src/pages/components/LineSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import RouteSelector from 'src/pages/components/RouteSelector'
import { Row } from 'src/pages/components/Row'
import StopSelector from 'src/pages/components/StopSelector'
import { TimelineBoard } from 'src/pages/components/timeline/TimelineBoard'
import { MARGIN_MEDIUM } from 'src/resources/sizes'
import Widget from 'src/shared/Widget'
import { SearchContext } from '../../model/pageState'
import { DateSelector } from '../components/DateSelector'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import { TimeSelector } from '../components/TimeSelector'

const StyledTimelineBoard = styled(TimelineBoard)`
  margin-top: ${MARGIN_MEDIUM * 3}px;
  margin-bottom: ${MARGIN_MEDIUM * 3}px;
`

const TimelinePage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp, routeKey } = search
  const [stopKey, setStopKey] = useState<string | undefined>()

  const time = useMemo(() => dayjs(search.timestamp), [timestamp])

  const routesQuery = useQuery({
    queryFn: async () => {
      if (operatorId && lineNumber) {
        try {
          const routes = await getRoutesAsync(time, time, operatorId, lineNumber)
          setSearch((prev) => ({ ...prev, routes }))
          return routes
        } catch (error) {
          console.error(error)
          setSearch((current) => ({ ...current, routes: undefined, routeKey: undefined }))
          setStopKey(undefined)
        }
      }
      return null
    },
    queryKey: ['routes', operatorId, lineNumber, time.valueOf()],
  })

  const selectedRoute = useMemo(() => {
    return routesQuery.data?.find((route) => route.key === routeKey)
  }, [routesQuery.data, routeKey])

  const stopsQuery = useQuery({
    queryFn: async () => {
      if (selectedRoute) {
        try {
          return await getStopsForRouteAsync(selectedRoute.routeIds, time)
        } catch (error) {
          console.error(error)
          setStopKey(undefined)
        }
      }
      return null
    },
    queryKey: ['stops', selectedRoute?.lineRef, time.valueOf()],
  })

  const selectedStop = useMemo(() => {
    return stopsQuery.data?.find((stop) => stop.key === stopKey)
  }, [stopsQuery.data, stopKey])

  const hitsQuery = useQuery({
    queryFn: async () => {
      if (selectedStop && selectedRoute) {
        const [gtfsTime, siriTime] = await Promise.all([
          getGtfsStopHitTimesAsync(selectedStop, time),
          getSiriStopHitTimesAsync(selectedRoute, selectedStop, time),
        ])
        return { gtfsTime, siriTime }
      }
      return null
    },
    queryKey: ['hits', selectedRoute?.lineRef, selectedStop?.stopId, time.valueOf()],
  })

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        {t('timeline_page_title')}
      </Typography>
      <Alert severity="info" variant="outlined" icon={false}>
        {t('timeline_page_description')}
      </Alert>
      {hitsQuery.data &&
        hitsQuery.data.gtfsTime.length > 0 &&
        hitsQuery.data.siriTime.length === 0 && (
          <Alert severity="warning" variant="outlined">
            {t('no_data_from_ETL')}
          </Alert>
        )}
      <Grid container spacing={2}>
        {/* choose date */}
        <Grid size={{ lg: 4, md: 6, xs: 12 }}>
          <DateSelector
            time={dayjs(timestamp)}
            onChange={(ts) => {
              if (!ts) return
              const currentTime = dayjs(timestamp)
              const newTimestamp = ts
                .hour(currentTime.hour())
                .minute(currentTime.minute())
                .second(currentTime.second())
                .valueOf()
              setSearch((current) => ({ ...current, timestamp: newTimestamp }))
            }}
          />
        </Grid>
        {/* choose time */}
        <Grid size={{ lg: 4, md: 6, xs: 12 }}>
          <TimeSelector
            time={dayjs(timestamp)}
            onChange={(ts) => {
              if (!ts) return
              const currentDate = dayjs(timestamp)
              const newTimestamp = currentDate
                .hour(ts.hour())
                .minute(ts.minute())
                .second(ts.second())
                .valueOf()
              setSearch((current) => ({ ...current, timestamp: newTimestamp }))
            }}
          />
        </Grid>
        {/* choose operator */}
        <Grid size={{ lg: 4, md: 6, xs: 12 }}>
          <OperatorSelector
            operatorId={operatorId}
            setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
          />
        </Grid>
        {/* choose line */}
        <Grid size={{ lg: 4, md: 6, xs: 12 }}>
          <LineNumberSelector
            lineNumber={lineNumber}
            setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
          />
        </Grid>
        {/* routes */}
        <Grid container size={{ lg: 4, md: 6, xs: 12 }}>
          <Row style={{ width: '100%' }}>
            <div style={{ width: '100%' }}>
              {routesQuery.data?.length === 0 ? (
                <NotFound>{t('line_not_found')}</NotFound>
              ) : (
                <RouteSelector
                  disabled={!routesQuery.data}
                  routes={routesQuery.data || []}
                  routeKey={routeKey}
                  setRouteKey={(key) => setSearch((current) => ({ ...current, routeKey: key }))}
                />
              )}
            </div>
            {routesQuery.isLoading && <CircularProgress />}
          </Row>
        </Grid>
        {/* stops */}
        <Grid container size={{ lg: 4, md: 6, xs: 12 }}>
          <Row style={{ width: '100%' }}>
            <div style={{ width: '100%' }}>
              <StopSelector
                disabled={!stopsQuery.data}
                stops={stopsQuery.data || []}
                stopKey={stopKey}
                setStopKey={(key) => setStopKey(key)}
              />
            </div>
            {stopsQuery.isLoading && <CircularProgress />}
          </Row>
        </Grid>
        {/* hits timeline */}
        {selectedRoute && selectedStop && (
          <Widget marginBottom>
            {hitsQuery.isLoading && (
              <Row>
                <Label text={t('loading_hits')} />
                <CircularProgress />
              </Row>
            )}
            {!hitsQuery.isLoading &&
              ((hitsQuery.data?.gtfsTime && hitsQuery.data.gtfsTime.length > 0) ||
              (hitsQuery.data?.siriTime && hitsQuery.data.siriTime.length > 0) ? (
                <StyledTimelineBoard
                  target={dayjs(timestamp)}
                  gtfsTimes={hitsQuery.data.gtfsTime}
                  siriTimes={hitsQuery.data.siriTime}
                />
              ) : (
                <NotFound>{t('hits_not_found')}</NotFound>
              ))}
          </Widget>
        )}
      </Grid>
    </PageContainer>
  )
}

export default TimelinePage

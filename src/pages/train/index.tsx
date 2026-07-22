import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { GlobalSearchContext } from 'src/model/globalState'
import { DateSelector } from 'src/pages/components/DateSelector'
import { PageContainer } from 'src/pages/components/PageContainer'
import Widget from 'src/shared/Widget'
import { TrainAverageDelayChart } from './TrainAverageDelayChart'
import { getTrainStationAverageDelays, groupTrainRides } from './trainData'
import { TrainRideTimeline } from './TrainRideTimeline'
import { useTrainRideStops, useTrainRoutes, useTrainVehicleLocations } from './useTrainData'

export default function TrainPage() {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(GlobalSearchContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const routeParam = searchParams.get('route')
  const [selectedRouteName, setSelectedRouteName] = useState('')
  const maxDate = toIsraelTimezone().subtract(1, 'day').startOf('day')
  const routesQuery = useTrainRoutes(search.date)
  useEffect(() => {
    if (!routeParam || !routesQuery.data) return
    const route = routesQuery.data.find((option) => option.lineRefs.includes(Number(routeParam)))
    setSelectedRouteName(route?.routeLongName ?? '')
  }, [routeParam, routesQuery.data])
  const selectedRoute = routesQuery.data?.find((route) => route.routeLongName === selectedRouteName)
  const lineRefs = selectedRoute?.lineRefs ?? []
  const stopsQuery = useTrainRideStops(search.date, lineRefs)
  const locationsQuery = useTrainVehicleLocations(search.date, lineRefs)
  useEffect(() => {
    if (dayjs.tz(search.date, ISRAEL_TIMEZONE).isAfter(maxDate)) {
      setSearch((current) => ({
        ...current,
        date: maxDate.format('YYYY-MM-DD'),
      }))
    }
  }, [maxDate, search.date, setSearch])

  useEffect(() => {
    if (
      selectedRouteName &&
      routesQuery.data &&
      !routesQuery.data.some((route) => route.routeLongName === selectedRouteName)
    ) {
      setSelectedRouteName('')
    }
  }, [routesQuery.data, selectedRouteName])

  const rides = useMemo(
    () => groupTrainRides(locationsQuery.data ?? [], stopsQuery.data ?? []),
    [locationsQuery.data, stopsQuery.data],
  )
  const error = routesQuery.error || stopsQuery.error || locationsQuery.error
  const isLoading = routesQuery.isLoading || stopsQuery.isLoading || locationsQuery.isLoading

  const averageDelays = useMemo(
    () => (rides.length > 1 ? getTrainStationAverageDelays(rides) : []),
    [rides],
  )

  return (
    <PageContainer>
      <Typography variant="h4" className="page-title">
        {t('train_page_title')}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <DateSelector
            time={dayjs.tz(search.date, ISRAEL_TIMEZONE)}
            maxDate={maxDate}
            onChange={(date) => {
              if (!date) return
              setSelectedRouteName('')
              setSearch((current) => ({
                ...current,
                date: toIsraelTimezone(date).format('YYYY-MM-DD'),
              }))
            }}
          />
        </Box>
        <FormControl sx={{ flex: 2 }} disabled={routesQuery.isLoading || !routesQuery.data?.length}>
          <InputLabel id="train-route-label">{t('train_choose_route')}</InputLabel>
          <Select
            labelId="train-route-label"
            value={selectedRouteName}
            label={t('train_choose_route')}
            onChange={(event) => {
              const routeName = event.target.value
              const route = routesQuery.data?.find((option) => option.routeLongName === routeName)
              setSelectedRouteName(routeName)
              setSearchParams((current) => {
                const next = new URLSearchParams(current)
                if (route) next.set('route', String(route.lineRefs[0]))
                else next.delete('route')
                return next
              })
            }}>
            {(routesQuery.data ?? []).map((route) => (
              <MenuItem key={route.routeLongName} value={route.routeLongName}>
                {`${route.routeLongName} (${t('rides_planned')} ${route.lineRefs.length})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isLoading && <CircularProgress />}
      {error && <Alert severity="error">{error.message}</Alert>}
      {selectedRoute && !isLoading && !error && rides.length === 0 && (
        <Alert severity="info">{t('train_no_rides')}</Alert>
      )}

      {averageDelays.length > 0 && (
        <Widget marginBottom title={t('train_average_delay_title')}>
          <TrainAverageDelayChart averages={averageDelays} />
        </Widget>
      )}

      {rides.map((ride) => (
        <Widget
          key={ride.rideId}
          marginBottom
          title={t('train_ride_summary', {
            lineRef: ride.lineRef ?? '-',
            scheduledTime: ride.scheduledStartTime
              ? toIsraelTimezone(ride.scheduledStartTime).format('HH:mm')
              : '-',
            trainNumber: ride.vehicleRef ?? '-',
            points: ride.locations.length,
            stops: ride.stops.length,
          })}
          titleSx={{ fontSize: '1rem' }}>
          <TrainRideTimeline ride={ride} />
        </Widget>
      ))}
    </PageContainer>
  )
}

import { MapTwoTone } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
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
import { toIsraelTimezone } from 'src/dayjs'
import { GlobalSearchContext } from 'src/model/globalState'
import { InitialUrlParamsContext, PageShareParamsContext } from 'src/model/routeContext'
import { addDays, todayCivilDate } from 'src/model/time/civilDate'
import { CivilDateSelector } from 'src/pages/components/CivilDateSelector'
import { PageContainer } from 'src/pages/components/PageContainer'
import Widget from 'src/shared/Widget'
import { TrainAverageDelayChart } from './TrainAverageDelayChart'
import { getTrainStationAverageDelays, groupTrainRides, type TrainRideData } from './trainData'
import { TrainRideMap } from './TrainRideMap'
import { TrainRideTimeline } from './TrainRideTimeline'
import { useTrainRideStops, useTrainRoutes, useTrainVehicleLocations } from './useTrainData'

export default function TrainPage() {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(GlobalSearchContext)
  const [searchParams] = useSearchParams()
  const initialUrlParams = useContext(InitialUrlParamsContext)
  const { setParams: setPageShareParams } = useContext(PageShareParamsContext)
  const [selectedLineRef, setSelectedLineRef] = useState(
    () => searchParams.get('route') ?? initialUrlParams.route ?? '',
  )
  useEffect(() => {
    delete initialUrlParams.route
  }, [initialUrlParams])

  // Yesterday: the day's SIRI data is only complete once the day is over.
  const maxDate = useMemo(() => addDays(todayCivilDate(), -1), [])
  const routesQuery = useTrainRoutes(search.date)
  const selectedRoute = routesQuery.data?.find((route) =>
    route.lineRefs.includes(Number(selectedLineRef)),
  )
  const selectedRouteName = selectedRoute?.routeLongName ?? ''
  const lineRefs = selectedRoute?.lineRefs ?? []
  const stopsQuery = useTrainRideStops(search.date, lineRefs)
  const locationsQuery = useTrainVehicleLocations(search.date, lineRefs)
  useEffect(() => {
    if (search.date > maxDate) {
      setSearch((current) => ({ ...current, date: maxDate }))
    }
  }, [maxDate, search.date, setSearch])

  useEffect(() => {
    if (selectedLineRef && routesQuery.data && !selectedRoute) {
      setSelectedLineRef('')
    }
  }, [routesQuery.data, selectedLineRef, selectedRoute])

  useEffect(() => {
    setPageShareParams(selectedLineRef ? { route: selectedLineRef } : {})
    return () => setPageShareParams({})
  }, [selectedLineRef, setPageShareParams])

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
          <CivilDateSelector
            value={search.date}
            maxDate={maxDate}
            onChange={(date) => {
              if (!date) return
              setSearch((current) => ({ ...current, date }))
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
              setSelectedLineRef(route ? String(route.lineRefs[0]) : '')
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
        <TrainRideCard key={ride.rideId} ride={ride} />
      ))}
    </PageContainer>
  )
}

export function TrainRideCard({ ride }: Readonly<{ ride: TrainRideData }>) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const title = t('train_ride_summary', {
    lineRef: ride.lineRef ?? '-',
    scheduledTime: ride.scheduledStartTime
      ? toIsraelTimezone(ride.scheduledStartTime).format('HH:mm')
      : '-',
    trainNumber: ride.vehicleRef ?? '-',
    points: ride.locations.length,
    stops: ride.stops.length,
  })

  return (
    <Widget
      marginBottom
      title={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title}
          <Button
            variant="outlined"
            startIcon={<MapTwoTone />}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}>
            {t(isOpen ? 'train_hide_ride_map' : 'train_show_ride_map')}
          </Button>
        </Box>
      }
      titleSx={{ fontSize: '1rem' }}>
      <TrainRideTimeline ride={ride} />
      {isOpen && <TrainRideMap ride={ride} />}
    </Widget>
  )
}

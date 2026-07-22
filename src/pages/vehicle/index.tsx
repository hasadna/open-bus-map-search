import { CircularProgress, Grid, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SIRI_API } from 'src/api/apiConfig'
import { getAllRoutesList } from 'src/api/gtfsService'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { fromGtfsRoute } from 'src/model/busRoute'
import { GlobalSearchContext } from 'src/model/globalState'
import { InitialUrlParamsContext, PageShareParamsContext } from 'src/model/routeContext'
import { serviceDayBounds } from 'src/pages/components/utils/startTimeUtils'
import VehicleSelector, { normalizeVehicleNumber } from 'src/pages/components/VehicleSelector'
import { DateSelector } from '../components/DateSelector'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'
import { buildVehicleRideRows, VehicleRideRow } from './buildVehicleRideRows'
import { VehicleTable } from './VehicleTable'

const VehiclePage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(GlobalSearchContext)
  const { date } = search
  const initialUrlParams = useContext(InitialUrlParamsContext)
  // LEGACY: manual share-param injection — replace with usePageState's per-page
  // persistent `params` when this page is migrated.
  const { setParams } = useContext(PageShareParamsContext)

  // The vehicle number is page-local — never in GlobalSearchContext. Seeded once on
  // mount from the URL captured at page load (InitialUrlParamsContext), and published
  // to PageShareParamsContext for the Share button — the same page-local-param
  // pattern gaps_patterns and timeBasedMap used before their usePageState migration.
  const [vehicleNumber, setVehicleNumber] = useState<number | undefined>(() =>
    normalizeVehicleNumber(initialUrlParams.vehicleNumber ?? ''),
  )

  useEffect(() => {
    if (vehicleNumber) setParams({ vehicleNumber: String(vehicleNumber) })
    else setParams({})
    return () => setParams({})
  }, [vehicleNumber, setParams])

  const { start: serviceDayStart, end: serviceDayEnd } = useMemo(
    () => serviceDayBounds(date),
    [date],
  )

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({
      ...current,
      date: toIsraelTimezone(time ?? dayjs()).format('YYYY-MM-DD'),
    }))
  }

  const {
    data: rides,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['vehicleRides', vehicleNumber, serviceDayStart.valueOf(), serviceDayEnd.valueOf()],
    enabled: !!vehicleNumber,
    queryFn: ({ signal }) =>
      SIRI_API.siriRidesListGet(
        {
          vehicleRefs: String(vehicleNumber),
          scheduledStartTimeFrom: serviceDayStart.toDate(),
          scheduledStartTimeTo: serviceDayEnd.toDate(),
          orderBy: 'scheduled_start_time asc',
          limit: 500,
        },
        { signal },
      ),
  })

  // SIRI rides carry only siri_route__line_ref; the human-readable line number and
  // route names (gtfs_route__*) are frequently null on the ride. Resolve them from
  // the operator's GTFS routes for the service day — same source the operator page
  // uses (getAllRoutesList) — and key by line ref to match each ride.
  const operatorIds = useMemo(
    () =>
      Array.from(
        new Set(
          (rides ?? [])
            .map((ride) => ride.gtfsRouteOperatorRef ?? ride.siriRouteOperatorRef)
            .filter((ref): ref is number => ref != null)
            .map(String),
        ),
      ),
    [rides],
  )

  const { data: routes } = useQuery({
    queryKey: ['vehicleRoutes', serviceDayStart.valueOf(), operatorIds],
    enabled: operatorIds.length > 0,
    queryFn: async ({ signal }) => {
      const routeLists = await Promise.all(
        operatorIds.map((operatorId) =>
          getAllRoutesList(operatorId, serviceDayStart.toDate(), signal),
        ),
      )
      return routeLists
        .flat()
        .map((route) => ({ ...fromGtfsRoute(route), agencyName: route.agencyName }))
    },
  })

  // Built here, not in queryFn: the query cache is persisted (JSON), and a Map
  // would not survive serialization — it rehydrates as a plain object with no .get.
  const routeByLineRef = useMemo(
    () => new Map((routes ?? []).map((route) => [String(route.lineRef), route])),
    [routes],
  )

  const rows = useMemo<VehicleRideRow[]>(
    () => buildVehicleRideRows({ rides, routeByLineRef, serviceDayStart, date }),
    [rides, serviceDayStart, date, routeByLineRef],
  )

  const handleRowClick = (payload: VehicleRideRow['setSearchPayload']) => {
    if (!payload) return
    setSearch((current) => ({ ...current, ...payload }))
  }

  return (
    <PageContainer>
      <Typography className="page-title" variant="h4">
        {t('vehicle_page_title')}
      </Typography>
      {/* choose date + vehicle — centered block, like the velocity-heatmap page */}
      <Grid container spacing={2} sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
        {/* choose date */}
        <Grid size={{ sm: 6, xs: 12 }}>
          <DateSelector time={dayjs.tz(date, ISRAEL_TIMEZONE)} onChange={handleDateChange} />
        </Grid>
        {/* choose vehicle */}
        <Grid size={{ sm: 6, xs: 12 }}>
          <VehicleSelector
            vehicleNumber={vehicleNumber}
            setVehicleNumber={(value) => setVehicleNumber(value || undefined)}
          />
        </Grid>
      </Grid>

      {vehicleNumber ? (
        isError ? (
          <NotFound>{t('vehicle_load_error')}</NotFound>
        ) : isFetching ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : rows.length === 0 ? (
          <NotFound>{t('vehicle_no_rides')}</NotFound>
        ) : (
          <VehicleTable rows={rows} onRowClick={handleRowClick} />
        )
      ) : null}
    </PageContainer>
  )
}

export default VehiclePage

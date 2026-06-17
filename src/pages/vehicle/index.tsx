import { SiriRideWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import {
  CircularProgress,
  Grid,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { SIRI_API } from 'src/api/apiConfig'
import { getAllRoutesList } from 'src/api/gtfsService'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { fromGtfsRoute } from 'src/model/busRoute'
import { GlobalSearchContext } from 'src/model/globalState'
import { ExtraShareParamsContext, InitialUrlParamsContext } from 'src/model/routeContext'
import {
  formatServiceDayTime,
  formatStartTimeForQuery,
  serviceDayBounds,
  serviceDayTokenToDisplay,
} from 'src/pages/components/utils/startTimeUtils'
import VehicleSelector, { normalizeVehicleNumber } from 'src/pages/components/VehicleSelector'
import { DateSelector } from '../components/DateSelector'
import { NotFound } from '../components/NotFound'
import { PageContainer } from '../components/PageContainer'

type VehicleRideRow = {
  id: number
  operator: string
  lineNumber: string
  origin: string
  destination: string
  displayTime: string
  href?: string
  setSearchPayload?: {
    operatorId: string
    lineNumber: string
    routeKey: string
    rideTime: string
  }
}

const VehiclePage = () => {
  const { t } = useTranslation()
  const { search, setSearch } = useContext(GlobalSearchContext)
  const { date } = search
  const initialUrlParams = useContext(InitialUrlParamsContext)
  const { setParams } = useContext(ExtraShareParamsContext)

  // The vehicle number is page-local — never in GlobalSearchContext. Seeded once on
  // mount from the URL captured at page load (InitialUrlParamsContext), and published
  // to ExtraShareParamsContext for the Share button — the same page-local-param
  // pattern as gaps_patterns' start/end dates and timeBasedMap's datetime.
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

  const rows = useMemo<VehicleRideRow[]>(() => {
    return (rides ?? [])
      .filter((ride): ride is SiriRideWithRelatedPydanticModel & { id: number } => !!ride.id)
      .map((ride) => {
        // The ride's own gtfs_route fields are frequently null; resolve the route from
        // the operator's GTFS routes via line ref (BusRoute carries the line number,
        // origin/destination names, operator and route key — same model the rest of
        // the app uses).
        const lineRef = ride.siriRouteLineRef ?? ride.gtfsRouteLineRef
        const route = lineRef != null ? routeByLineRef?.get(String(lineRef)) : undefined
        const operatorId = route?.operatorId ?? ride.siriRouteOperatorRef?.toString()
        const lineNumber = route?.lineNumber
        const token = ride.scheduledStartTime
          ? formatServiceDayTime(toIsraelTimezone(ride.scheduledStartTime), serviceDayStart)
          : undefined
        const { time, nextDay } = token
          ? serviceDayTokenToDisplay(token)
          : { time: '—', nextDay: false }

        // A ride is linkable to single-line-map only if we can fully reconstruct its
        // route identity (operator + line + GTFS route key) and departure token.
        const canLink = !!(operatorId && lineNumber && route?.key && token)
        const rideTime = token ? formatStartTimeForQuery(token) : ''
        const setSearchPayload =
          canLink && route?.key && operatorId && lineNumber
            ? { operatorId, lineNumber, routeKey: route.key, rideTime }
            : undefined
        const href = setSearchPayload
          ? `/single-line-map?${new URLSearchParams({
              date,
              operatorId: setSearchPayload.operatorId,
              lineNumber: setSearchPayload.lineNumber,
              routeKey: setSearchPayload.routeKey,
              rideTime: setSearchPayload.rideTime,
            }).toString()}`
          : undefined

        return {
          id: ride.id,
          operator: route?.agencyName ?? operatorId ?? '—',
          lineNumber: lineNumber ?? '—',
          origin: route?.fromName || '—',
          destination: route?.toName || '—',
          displayTime: nextDay ? `🌙 ${time}` : time,
          href,
          setSearchPayload,
        }
      })
  }, [rides, serviceDayStart, date, routeByLineRef])

  const handleRowClick = (payload: VehicleRideRow['setSearchPayload']) => {
    if (!payload) return
    setSearch((current) => ({ ...current, ...payload }))
  }

  return (
    <PageContainer>
      <Typography className="page-title" variant="h4">
        {t('vehicle_page_title')}
      </Typography>
      <Grid container spacing={2} sx={{ maxWidth: 600 }}>
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
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small" aria-label={t('vehicle_page_title')}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('operator_title')}</TableCell>
                  <TableCell>{t('line')}</TableCell>
                  <TableCell>{t('operator.origin')}</TableCell>
                  <TableCell>{t('operator.destination')}</TableCell>
                  <TableCell>{t('vehicle_rides_start_time')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.operator}</TableCell>
                    <TableCell>{row.lineNumber}</TableCell>
                    <TableCell>{row.origin}</TableCell>
                    <TableCell>{row.destination}</TableCell>
                    <TableCell>
                      {row.href ? (
                        <MuiLink
                          component={Link}
                          to={row.href}
                          underline="hover"
                          onClick={() => handleRowClick(row.setSearchPayload)}>
                          {row.displayTime}
                        </MuiLink>
                      ) : (
                        row.displayTime
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : null}
    </PageContainer>
  )
}

export default VehiclePage

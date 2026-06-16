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
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { GlobalSearchContext } from 'src/model/globalState'
import { ExtraShareParamsContext, InitialUrlParamsContext } from 'src/model/routeContext'
import { routeStartEnd } from 'src/pages/components/utils/rotueUtils'
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
  route: string
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

  const rows = useMemo<VehicleRideRow[]>(() => {
    return (rides ?? [])
      .filter((ride): ride is SiriRideWithRelatedPydanticModel & { id: number } => !!ride.id)
      .map((ride) => {
        const [from, to] = routeStartEnd(ride.gtfsRouteRouteLongName)
        const operatorId = (ride.gtfsRouteOperatorRef ?? ride.siriRouteOperatorRef)?.toString()
        const lineNumber = ride.gtfsRouteRouteShortName ?? undefined
        const token = ride.scheduledStartTime
          ? formatServiceDayTime(toIsraelTimezone(ride.scheduledStartTime), serviceDayStart)
          : undefined
        const { time, nextDay } = token
          ? serviceDayTokenToDisplay(token)
          : { time: '—', nextDay: false }

        // A ride is linkable to single-line-map only if we can fully reconstruct its
        // route identity (operator + line + GTFS route key) and departure token.
        const routeKey =
          ride.gtfsRouteRouteMkt != null &&
          ride.gtfsRouteRouteDirection != null &&
          ride.gtfsRouteRouteAlternative != null
            ? `${ride.gtfsRouteRouteMkt}-${ride.gtfsRouteRouteDirection}-${ride.gtfsRouteRouteAlternative}`
            : undefined
        const canLink = !!(operatorId && lineNumber && routeKey && token)
        const rideTime = token ? formatStartTimeForQuery(token) : ''
        const setSearchPayload =
          canLink && routeKey && operatorId && lineNumber
            ? { operatorId, lineNumber, routeKey, rideTime }
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
          operator: ride.gtfsRouteAgencyName ?? operatorId ?? '—',
          lineNumber: lineNumber ?? '—',
          route: from || to ? `${from} ⇄ ${to}` : '—',
          displayTime: nextDay ? `🌙 ${time}` : time,
          href,
          setSearchPayload,
        }
      })
  }, [rides, serviceDayStart, date])

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
                  <TableCell>{t('vehicle_rides_route')}</TableCell>
                  <TableCell>{t('vehicle_rides_start_time')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.operator}</TableCell>
                    <TableCell>{row.lineNumber}</TableCell>
                    <TableCell>{row.route}</TableCell>
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

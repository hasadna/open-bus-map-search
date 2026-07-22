import type {
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { getDistance } from 'geolib'
import dayjs, { ISRAEL_TIMEZONE, utcNoonForDateStr } from 'src/dayjs'

export const TRAIN_OPERATOR_REF = '2'
export const API_PAGE_SIZE = 10_000

export type TrainRouteOption = {
  routeLongName: string
  lineRefs: number[]
}

export type TrainRideData = {
  rideId: number
  lineRef?: number
  scheduledStartTime?: Date
  vehicleRef?: string
  gtfsRideId?: number
  locations: SiriVehicleLocationWithRelatedPydanticModel[]
  stops: GtfsRideStopWithRelatedPydanticModel[]
}

export type TrainStationTiming = {
  id?: number
  gtfsStopId?: number
  stopSequence?: number
  name?: string
  plannedTime?: Date
  distanceMeters?: number
  delayMinutes?: number
  status: 'on-time' | 'out-of-range' | 'no-data'
}

const MAX_STATION_DISTANCE_METERS = 2_000
const STATION_DISTANCE_BUFFER_METERS = 200
const MAX_STATION_TIME_DIFFERENCE_MINUTES = 30
const MIN_ON_TIME_DELAY_MINUTES = -1
const MAX_ON_TIME_DELAY_MINUTES = 5

function getTimestamp(value: Date | string | undefined) {
  if (value === undefined) return undefined
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isNaN(timestamp) ? undefined : timestamp
}

function createStationTiming(
  stop: GtfsRideStopWithRelatedPydanticModel,
  details: Pick<TrainStationTiming, 'status' | 'distanceMeters' | 'delayMinutes'>,
): TrainStationTiming {
  return {
    id: stop.id,
    gtfsStopId: stop.gtfsStopId,
    stopSequence: stop.stopSequence,
    name: stop.gtfsStopName,
    plannedTime: stop.arrivalTime,
    ...details,
  }
}

export function getTrainStationTimings(
  stops: GtfsRideStopWithRelatedPydanticModel[],
  locations: SiriVehicleLocationWithRelatedPydanticModel[],
): TrainStationTiming[] {
  return stops.map((stop, stopIndex) => {
    const plannedTimestamp = getTimestamp(stop.arrivalTime)
    if (
      plannedTimestamp === undefined ||
      stop.gtfsStopLat === undefined ||
      stop.gtfsStopLon === undefined
    ) {
      return createStationTiming(stop, { status: 'no-data' })
    }

    const candidates: { distance: number; recordedTimestamp: number }[] = []

    for (const location of locations) {
      if (location.lat === undefined || location.lon === undefined) continue
      const recordedTimestamp = getTimestamp(location.recordedAtTime)
      if (recordedTimestamp === undefined) continue
      if (
        Math.abs(recordedTimestamp - plannedTimestamp) >
        MAX_STATION_TIME_DIFFERENCE_MINUTES * 60_000
      ) {
        continue
      }
      const distance = getDistance(
        { latitude: stop.gtfsStopLat, longitude: stop.gtfsStopLon },
        { latitude: location.lat, longitude: location.lon },
      )
      if (distance <= MAX_STATION_DISTANCE_METERS) candidates.push({ distance, recordedTimestamp })
    }

    if (candidates.length === 0) {
      return createStationTiming(stop, { status: 'no-data' })
    }

    const nearestDistance = Math.min(...candidates.map((candidate) => candidate.distance))
    const adaptiveDistance = Math.min(
      nearestDistance + STATION_DISTANCE_BUFFER_METERS,
      MAX_STATION_DISTANCE_METERS,
    )
    const latest = candidates
      .filter((candidate) => candidate.distance <= adaptiveDistance)
      .reduce((current, candidate) =>
        candidate.recordedTimestamp > current.recordedTimestamp ? candidate : current,
      )

    const delayMinutes = (latest.recordedTimestamp - plannedTimestamp) / 60_000
    const status =
      (delayMinutes < MIN_ON_TIME_DELAY_MINUTES && stopIndex !== stops.length - 1) ||
      delayMinutes > MAX_ON_TIME_DELAY_MINUTES
        ? 'out-of-range'
        : 'on-time'

    return createStationTiming(stop, {
      distanceMeters: latest.distance,
      delayMinutes,
      status,
    })
  })
}

export type TrainStationAverageDelay = {
  stationKey: string
  name: string
  averageDelayMinutes: number
}

export function getTrainStationAverageDelays(rides: TrainRideData[]): TrainStationAverageDelay[] {
  const stations = new Map<
    string,
    { name: string; stopSequence: number; totalDelayMinutes: number; sampleCount: number }
  >()

  for (const ride of rides) {
    for (const timing of getTrainStationTimings(ride.stops, ride.locations)) {
      if (timing.delayMinutes === undefined) continue
      const stationKey = timing.gtfsStopId?.toString() ?? timing.name
      if (!stationKey) continue

      const station = stations.get(stationKey) ?? {
        name: timing.name ?? '-',
        stopSequence: timing.stopSequence ?? Number.MAX_SAFE_INTEGER,
        totalDelayMinutes: 0,
        sampleCount: 0,
      }
      station.stopSequence = Math.min(
        station.stopSequence,
        timing.stopSequence ?? Number.MAX_SAFE_INTEGER,
      )
      station.totalDelayMinutes += timing.delayMinutes
      station.sampleCount += 1
      stations.set(stationKey, station)
    }
  }

  return Array.from(stations)
    .sort(([, a], [, b]) => a.stopSequence - b.stopSequence)
    .map(([stationKey, station]) => ({
      stationKey,
      name: station.name,
      averageDelayMinutes: station.totalDelayMinutes / station.sampleCount,
    }))
}

export function getTrainDateRange(date: string) {
  const start = dayjs.tz(date, ISRAEL_TIMEZONE).startOf('day')
  const nextDate = start.add(1, 'day')

  return {
    dateFrom: utcNoonForDateStr(start.format('YYYY-MM-DD')),
    dateTo: utcNoonForDateStr(start.format('YYYY-MM-DD')),
    timeFrom: start.toDate(),
    timeTo: nextDate.toDate(),
  }
}

export function groupTrainRoutes(routes: GtfsRoutePydanticModel[]): TrainRouteOption[] {
  const grouped = new Map<string, Set<number>>()

  for (const route of routes) {
    const routeLongName =
      route.routeLongName?.trim() || `${route.routeShortName || 'Route'} (${route.lineRef})`
    const lineRefs = grouped.get(routeLongName) ?? new Set<number>()
    lineRefs.add(route.lineRef)
    grouped.set(routeLongName, lineRefs)
  }

  return Array.from(grouped, ([routeLongName, lineRefs]) => ({
    routeLongName,
    lineRefs: Array.from(lineRefs).sort((a, b) => a - b),
  })).sort((a, b) => a.routeLongName.localeCompare(b.routeLongName))
}

export function groupTrainRides(
  locations: SiriVehicleLocationWithRelatedPydanticModel[],
  stops: GtfsRideStopWithRelatedPydanticModel[],
): TrainRideData[] {
  const stopsByRideId = new Map<number, GtfsRideStopWithRelatedPydanticModel[]>()
  for (const stop of stops) {
    if (stop.gtfsRideId === undefined) continue
    const rideStops = stopsByRideId.get(stop.gtfsRideId) ?? []
    rideStops.push(stop)
    stopsByRideId.set(stop.gtfsRideId, rideStops)
  }

  const stopsByLineAndStartTime = new Map<string, GtfsRideStopWithRelatedPydanticModel[]>()
  for (const rideStops of stopsByRideId.values()) {
    rideStops.sort((a, b) => (a.stopSequence ?? 0) - (b.stopSequence ?? 0))
    const firstStop = rideStops[0]
    const arrivalTimestamp = getTimestamp(firstStop.arrivalTime)
    if (firstStop.gtfsRouteLineRef === undefined || arrivalTimestamp === undefined) continue
    stopsByLineAndStartTime.set(`${firstStop.gtfsRouteLineRef}:${arrivalTimestamp}`, rideStops)
  }

  const locationsByRideId = new Map<number, SiriVehicleLocationWithRelatedPydanticModel[]>()
  for (const location of locations) {
    if (location.siriRideId === undefined) continue
    const rideLocations = locationsByRideId.get(location.siriRideId) ?? []
    rideLocations.push(location)
    locationsByRideId.set(location.siriRideId, rideLocations)
  }

  return Array.from(locationsByRideId, ([rideId, rideLocations]) => {
    const firstLocation = rideLocations[0]
    const gtfsRideId = firstLocation.siriRideGtfsRideId
    const scheduledStartTimestamp = getTimestamp(firstLocation.siriRideScheduledStartTime)
    const fallbackKey =
      firstLocation.siriRouteLineRef !== undefined && scheduledStartTimestamp !== undefined
        ? `${firstLocation.siriRouteLineRef}:${scheduledStartTimestamp}`
        : undefined
    const rideStops =
      (gtfsRideId !== undefined ? stopsByRideId.get(gtfsRideId) : undefined) ??
      (fallbackKey ? stopsByLineAndStartTime.get(fallbackKey) : undefined) ??
      []

    return {
      rideId,
      lineRef: firstLocation.siriRouteLineRef,
      scheduledStartTime: firstLocation.siriRideScheduledStartTime,
      vehicleRef: firstLocation.siriRideVehicleRef,
      gtfsRideId,
      locations: rideLocations.sort(
        (a, b) => (getTimestamp(a.recordedAtTime) ?? 0) - (getTimestamp(b.recordedAtTime) ?? 0),
      ),
      stops: rideStops,
    }
  }).sort(
    (a, b) => (getTimestamp(a.scheduledStartTime) ?? 0) - (getTimestamp(b.scheduledStartTime) ?? 0),
  )
}

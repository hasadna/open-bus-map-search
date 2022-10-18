import { SiriApi, SiriVehicleLocationWithRelatedPydanticModel } from 'open-bus-stride-client'
import { API_CONFIG, MAX_HITS_COUNT } from 'src/api/apiConfig'
import { BusStop } from 'src/model/busStop'
import moment, { Moment } from 'moment'
import { geoLocationBoundary, nearestLocation } from 'src/api/geoService'
import { Coordinates } from 'src/model/location'
import { log } from 'src/log'
import { BusRoute } from 'src/model/busRoute'

const SIRI_API = new SiriApi(API_CONFIG)
const LOCATION_DELTA_METERS = 250

async function getRidesAsync(route: BusRoute, stop: BusStop, timestamp: moment.Moment) {
  return await SIRI_API.siriRidesListGet({
    limit: 1,
    gtfsRouteDateFrom: timestamp.toDate(),
    gtfsRouteDateTo: timestamp.toDate(),
    gtfsRideStartTimeFrom: moment(timestamp).subtract(1, 'days').toDate(),
    gtfsRideStartTimeTo: moment(timestamp).add(1, 'days').toDate(),
    scheduledStartTimeFrom: moment(timestamp).subtract(1, 'days').toDate(),
    scheduledStartTimeTo: moment(timestamp).add(1, 'days').toDate(),
    gtfsRideGtfsRouteId: stop.routeId,
    gtfsRouteOperatorRefs: route.operatorId,
    gtfsRouteRouteShortName: route.lineNumber,
    gtfsRouteRouteDirection: route.direction,
  })
}

export async function getSiriStopHitTimesAsync(
  route: BusRoute,
  stop: BusStop,
  timestamp: Moment,
): Promise<Date[]> {
  log('looking for rides arriving at stop around time', {
    route,
    stopId: stop.stopId,
    timestamp: timestamp.toDate(),
  })

  const rides = await getRidesAsync(route, stop, timestamp)
  if (rides.length === 0) {
    return []
  }

  const siriRouteId = rides[0].siriRouteId!

  const boundary = geoLocationBoundary(stop.location, LOCATION_DELTA_METERS)

  const locations = await SIRI_API.siriVehicleLocationsListGet({
    limit: 1024,
    siriRoutesIds: siriRouteId.toString(),
    recordedAtTimeFrom: moment(timestamp).subtract(2, 'hours').toDate(),
    recordedAtTimeTo: moment(timestamp).add(2, 'hours').toDate(),
    latGreaterOrEqual: boundary.lowerBound.latitude,
    latLowerOrEqual: boundary.upperBound.latitude,
    lonGreaterOrEqual: boundary.lowerBound.longitude,
    lonLowerOrEqual: boundary.upperBound.longitude,
    orderBy: 'distance_from_siri_ride_stop_meters desc',
  })

  type EnrichedLocation = SiriVehicleLocationWithRelatedPydanticModel & Coordinates

  const locationsByRideId = locations.reduce((acc, location) => {
    if (location.siriRideId) {
      ;(acc[location.siriRideId.toString()] ||= []).push({
        ...location,
        longitude: location.lon || 0,
        latitude: location.lat || 0,
      })
    }
    return acc
  }, {} as { [key: string]: EnrichedLocation[] })
  const stopHits = Object.values(locationsByRideId).map(
    (locations) => nearestLocation(stop.location, locations) as EnrichedLocation,
  )

  const diffFromTargetStart = (location: EnrichedLocation): number =>
    Math.abs(timestamp.diff(location.recordedAtTime, 'seconds'))

  const closestInTimeHits = stopHits
    .sort((a, b) => diffFromTargetStart(a) - diffFromTargetStart(b))
    .slice(0, MAX_HITS_COUNT)
  return closestInTimeHits.map((value) => value.recordedAtTime!).sort()
}

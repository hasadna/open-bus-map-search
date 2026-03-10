import {
  SiriRideWithRelatedPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { SIRI_API } from 'src/api/apiConfig'
import { geoLocationBoundary, nearestLocation } from 'src/api/geoService'
import dayjs from 'src/dayjs'
import { BusRoute } from 'src/model/busRoute'
import { BusStop } from 'src/model/busStop'
import { Coordinates } from 'src/model/location'

const LOCATION_DELTA_METERS = 500

export async function getSiriRideWithRelated(
  siriRouteId: string,
  vehicleRefs: string,
  siriRouteLineRefs: string,
) {
  const gtfs_route_promise: SiriRideWithRelatedPydanticModel[] = await SIRI_API.siriRidesListGet({
    limit: 1,
    siriRouteIds: siriRouteId.toString(),
    siriRouteLineRefs,
    vehicleRefs,
  })

  return gtfs_route_promise[0]
}

export async function getSiriStopHitTimesAsync(
  route: BusRoute,
  stop: BusStop,
  timestamp: dayjs.Dayjs,
) {
  const boundary = geoLocationBoundary(stop.location, LOCATION_DELTA_METERS)

  const locations = await SIRI_API.siriVehicleLocationsListGet({
    limit: 1024,
    siriRoutesLineRef: route.lineRef.toString(),
    recordedAtTimeFrom: dayjs(timestamp).subtract(4, 'hour').toDate(),
    recordedAtTimeTo: dayjs(timestamp).add(4, 'hour').toDate(),
    latGreaterOrEqual: boundary.lowerBound.latitude,
    latLowerOrEqual: boundary.upperBound.latitude,
    lonGreaterOrEqual: boundary.lowerBound.longitude,
    lonLowerOrEqual: boundary.upperBound.longitude,
    orderBy: 'distance_from_siri_ride_stop_meters desc',
  })

  type EnrichedLocation = SiriVehicleLocationWithRelatedPydanticModel & Coordinates

  const locationsByRideId = locations.reduce(
    (acc, location) => {
      if (location.siriRideId) {
        ;(acc[location.siriRideId.toString()] ||= []).push({
          ...location,
          longitude: location.lon || 0,
          latitude: location.lat || 0,
        })
      }
      return acc
    },
    {} as { [key: string]: EnrichedLocation[] },
  )
  const stopHits = Object.values(locationsByRideId).map(
    (locations) => nearestLocation(stop.location, locations) as EnrichedLocation,
  )

  const diffFromTargetStart = (location: EnrichedLocation): number =>
    Math.abs(timestamp.diff(dayjs(location.recordedAtTime), 'second'))

  const closestInTimeHits = stopHits.sort((a, b) => diffFromTargetStart(a) - diffFromTargetStart(b))
  return closestInTimeHits.sort((a, b) => a.recordedAtTime!.getTime() - b.recordedAtTime!.getTime())
}

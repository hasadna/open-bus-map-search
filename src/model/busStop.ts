import {
  GtfsRideStopPydanticModel,
  GtfsStopPydanticModel,
} from 'open-bus-stride-client/openapi/models'
import { LatLngTuple } from 'leaflet'
import { GtfsRidePydanticModel, GtfsRideWithRelatedPydanticModel } from 'open-bus-stride-client'
import moment from 'moment'

export type BusStop = {
  key: string
  stopId: number
  routeId: number
  stopSequence: number
  name: string
  code: string
  location: LatLngTuple
  minutesFromRouteStartTime: number
}

export function fromGtfsStop(
  gtfsRideStop: GtfsRideStopPydanticModel,
  gtfsStop: GtfsStopPydanticModel,
  ride: GtfsRideWithRelatedPydanticModel,
): BusStop {
  const { arrivalTime } = gtfsRideStop
  const minutesFromRouteStartTime = arrivalTime
    ? moment(arrivalTime).diff(ride.startTime, 'minutes')
    : 0
  return {
    key: gtfsRideStop.id.toString(),
    stopId: gtfsRideStop.gtfsStopId,
    routeId: ride.gtfsRouteId || 0,
    stopSequence: gtfsRideStop.stopSequence || 0,
    name: `${gtfsStop.name} (${gtfsStop.city})`,
    code: gtfsStop.code.toString(),
    location: [gtfsStop.lat || 0, gtfsStop.lon || 0],
    minutesFromRouteStartTime,
  }
}

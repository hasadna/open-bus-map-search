import {
  GtfsRideStopPydanticModel,
  GtfsStopPydanticModel,
} from 'open-bus-stride-client/openapi/models'
import { GtfsRideWithRelatedPydanticModel } from 'open-bus-stride-client'
import dayjs from 'dayjs'
import { Coordinates } from 'src/model/location'

export type BusStop = {
  date: Date
  key: string
  stopId: number
  routeId: number
  stopSequence: number
  name: string
  code: string
  location: Coordinates
  minutesFromRouteStartTime: number
}

export function fromGtfsStop(
  gtfsRideStop: GtfsRideStopPydanticModel,
  gtfsStop: GtfsStopPydanticModel,
  ride: GtfsRideWithRelatedPydanticModel,
): BusStop {
  const { arrivalTime } = gtfsRideStop
  const minutesFromRouteStartTime = arrivalTime
    ? dayjs(arrivalTime).diff(ride.startTime, 'minutes')
    : 0
  return {
    date: gtfsStop.date,
    key: gtfsRideStop.id.toString(),
    stopId: gtfsRideStop.gtfsStopId,
    routeId: ride.gtfsRouteId || 0,
    stopSequence: gtfsRideStop.stopSequence || 0,
    name: `${gtfsStop.name} (${gtfsStop.city})`,
    code: gtfsStop.code.toString(),
    location: { latitude: gtfsStop.lat || 0, longitude: gtfsStop.lon || 0 },
    minutesFromRouteStartTime,
  }
}

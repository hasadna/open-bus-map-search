import {
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRideWithRelatedPydanticModel,
  GtfsStopPydanticModel,
} from '@hasadna/open-bus-api-client'
import dayjs, { formatIsraelDate } from 'src/dayjs'
import { Coordinates } from 'src/model/location'

export type BusStop = {
  date: string
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
  gtfsRideStop: GtfsRideStopWithRelatedPydanticModel,
  gtfsStop: GtfsStopPydanticModel,
  ride: GtfsRideWithRelatedPydanticModel,
): BusStop {
  const { arrivalTime } = gtfsRideStop
  const minutesFromRouteStartTime = arrivalTime
    ? dayjs(arrivalTime).diff(ride.startTime, 'minutes')
    : 0
  return {
    date: formatIsraelDate(gtfsStop.date),
    // Key on the stop CODE, not the gtfs_ride_stop id: GTFS is reloaded daily so
    // the row id (and gtfsStopId) change every date, which made a persisted
    // stopKey fail to match after a date change. The code is stable per physical
    // stop across dates and is shared by all lines that serve it.
    key: gtfsStop.code.toString(),
    stopId: gtfsRideStop.gtfsStopId!,
    routeId: ride.gtfsRouteId || 0,
    stopSequence: gtfsRideStop.stopSequence || 0,
    name: `${gtfsStop.name} (${gtfsStop.city})`,
    code: gtfsStop.code.toString(),
    location: { latitude: gtfsStop.lat || 0, longitude: gtfsStop.lon || 0 },
    minutesFromRouteStartTime,
  }
}

import {
  GtfsRideStopPydanticModel,
  GtfsStopPydanticModel,
} from 'open-bus-stride-client/openapi/models'
import { LatLngTuple } from 'leaflet'

export type BusStop = {
  key: string
  stopId: number
  routeId: number
  stopSequence: number
  name: string
  code: string
  location: LatLngTuple
}

export function fromGtfsStop(
  gtfsRideStop: GtfsRideStopPydanticModel,
  gtfsStop: GtfsStopPydanticModel,
): BusStop {
  return {
    key: gtfsRideStop.id.toString(),
    stopId: gtfsRideStop.gtfsStopId,
    routeId: gtfsRideStop.gtfsRideId,
    stopSequence: gtfsRideStop.stopSequence || 0,
    name: `${gtfsStop.name} (${gtfsStop.city})`,
    code: gtfsStop.code.toString(),
    location: [gtfsStop.lat || 0, gtfsStop.lon || 0],
  }
}

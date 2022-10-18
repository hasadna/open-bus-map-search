import { GtfsRoutePydanticModel } from 'open-bus-stride-client/openapi/models'
import { strLeftBack } from 'underscore.string'

export type BusRoute = {
  key: string
  operatorId: string
  lineNumber: string
  fromName: string
  toName: string
  direction: string
  routeIds: number[]
}

export function fromGtfsRoute(gtfsRoute: GtfsRoutePydanticModel): BusRoute {
  const cleanedName = strLeftBack(gtfsRoute.routeLongName!, '-')
  const parts = cleanedName.split('<->')
  return {
    operatorId: gtfsRoute.operatorRef.toString(),
    lineNumber: gtfsRoute.routeShortName!,
    key: gtfsRoute.routeLongName!,
    fromName: parts[0] || '',
    toName: parts[1] || '',
    direction: gtfsRoute.routeDirection!,
    routeIds: [gtfsRoute.id],
  }
}

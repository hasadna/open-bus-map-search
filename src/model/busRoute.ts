import { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'

export type BusRoute = {
  date: Date
  key: string
  operatorId: string
  lineNumber: string
  fromName: string
  toName: string
  direction: string
  routeIds: number[]
  lineRef: number
  routeAlternative: string
  mkt: string
}

const strLeftBack = (str: string, dash: string) => {
  const lastDashIndex = str.lastIndexOf(dash)
  return lastDashIndex === -1 ? str : str.slice(0, lastDashIndex)
}

export function fromGtfsRoute(gtfsRoute: GtfsRoutePydanticModel): BusRoute {
  const cleanedName = strLeftBack(gtfsRoute.routeLongName!, '-')
  const parts = cleanedName.split('<->')
  return {
    date: gtfsRoute.date,
    operatorId: gtfsRoute.operatorRef.toString(),
    lineNumber: gtfsRoute.routeShortName!,
    key: `${gtfsRoute.routeMkt}-${gtfsRoute.routeDirection}`,
    fromName: parts[0] || '',
    toName: parts[1] || '',
    direction: gtfsRoute.routeDirection!,
    routeIds: [gtfsRoute.id],
    lineRef: gtfsRoute.lineRef,
    routeAlternative: gtfsRoute.routeAlternative!,
    mkt: gtfsRoute.routeMkt!,
  }
}

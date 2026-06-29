import { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import { formatIsraelDate } from 'src/dayjs'
import { routeStartEnd } from 'src/pages/components/utils/rotueUtils'

export type BusRoute = {
  date: string
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

export function fromGtfsRoute(gtfsRoute: GtfsRoutePydanticModel): BusRoute {
  const [fromName, toName] = routeStartEnd(gtfsRoute.routeLongName)

  return {
    date: formatIsraelDate(gtfsRoute.date),
    operatorId: gtfsRoute.operatorRef.toString(),
    lineNumber: gtfsRoute.routeShortName!,
    key: `${gtfsRoute.routeMkt}-${gtfsRoute.routeDirection}-${gtfsRoute.routeAlternative}`,
    fromName,
    toName,
    direction: gtfsRoute.routeDirection!,
    routeIds: [gtfsRoute.id],
    lineRef: gtfsRoute.lineRef,
    routeAlternative: gtfsRoute.routeAlternative!,
    mkt: gtfsRoute.routeMkt!,
  }
}

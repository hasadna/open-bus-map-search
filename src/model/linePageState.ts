import { Moment } from 'moment'
import { BusRoute } from 'src/model/busRoute'
import { BusStop } from 'src/model/busStop'

export type LinePageState = {
  timestamp: Moment
  operatorId?: string
  lineNumber?: string
  routeKey?: string
  routes?: BusRoute[]
  stops?: BusStop[]
  stopKey?: string
  stopName?: string
  gtfsHitTimes?: Date[]
  siriHitTimes?: Date[]
}

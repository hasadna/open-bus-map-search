import { Moment } from 'moment'
import { BusRoute } from 'src/model/busRoute'
import { BusStop } from 'src/model/busStop'

export type LinePageState = {
  operatorId?: string
  lineNumber?: string
  routeKey?: string
  timestamp: Moment
  stopKey?: string
  gtfsHitTimes?: Date[]
  siriHitTimes?: Date[]
  routes?: BusRoute[]
  stops?: BusStop[]
}

import { Configuration, GtfsApi } from 'open-bus-stride-client'
import agencyList from 'open-bus-stride-client/agencies/agencyList'
import moment from 'moment'

//const BASE_PATH = "https://open-bus-stride-api.hasadna.org.il";
const BASE_PATH = 'http://localhost:3000/api'
const API_CONFIG = new Configuration({ basePath: BASE_PATH })
const GTFS_API = new GtfsApi(API_CONFIG)

export async function getStops(BASELINE_TIME: Date) {
  const routes = await GTFS_API.gtfsRoutesListGet({
    routeShortName: '1',
    operatorRefs: agencyList.find((value) => value.agency_name === 'דן')!.agency_id,
    dateFrom: BASELINE_TIME,
    dateTo: BASELINE_TIME,
    limit: 10,
  })
  console.error(routes.map((route) => [route.id, route.routeDirection, route.routeLongName]))

  const route_id = routes[0].id
  const rides = await GTFS_API.gtfsRidesListGet({
    gtfsRouteId: route_id,
    startTimeTo: moment(BASELINE_TIME).add(60, 'm').toDate(),
    startTimeFrom: moment(BASELINE_TIME).subtract(60, 'm').toDate(),
    limit: 10,
    orderBy: 'start_time',
  })
  console.error(rides.map((ride) => ride.startTime))

  const ride_id = rides[0].id?.toString()
  const stops = await GTFS_API.gtfsRideStopsListGet({
    gtfsRideIds: ride_id,
  })

  for (const ride_stop of stops.sort((a, b) => a.stopSequence! - b.stopSequence!)) {
    const stop = await GTFS_API.gtfsStopsGetGet({ id: ride_stop.gtfsStopId })
    console.error(stop.name, stop.code, ride_stop.arrivalTime)
  }
}

import { GTFS_API } from 'src/api/apiConfig'

export async function getGtfsRidesList(
  date: Date | undefined,
  operator: string | undefined,
  lineNumber: string | undefined,
  routeKey: string | undefined,
) {
  const gtfsRidesList = await GTFS_API.listGtfsRidesListGet({
    gtfsRouteDateFrom: date,
    gtfsRouteDateTo: date,
    gtfsRouteOperatorRefs: operator,
    gtfsRouteRouteShortName: lineNumber,
    gtfsRouteRouteLongNameContains: routeKey,
  })

  return gtfsRidesList.sort((a, b) => +a.startTime! - +b.startTime!)
}

// type RidesList = {
//   operator_ref: string
//   route_short_name: string
//   route_route_direction: string
//   route_date_from: Date
//   route_date_to: Date
// }[]

// type RawRidesList = {
//   operator_ref: string
//   route_short_name: string
//   route_route_direction: string
//   route_date_from: string
//   route_date_to: string
// }[]

// const USE_API = true
// const LIMIT = 10000

// export const getRidesAsync = async (
//   operator_ref?: string,
//   route_short_name?: string,
//   route_route_direction?: string,
//   route_date_from?: string,
//   route_date_to?: string,
// ): Promise<RawRidesList> => {
//   // const startOfDay = dayjs(fromTimestamp).startOf('day')
//   const data = USE_API
//     ? (0
//         await axios.get<RawRidesList>(`${STRIDE_API_BASE_PATH}/rides_rides/list`, {
//           params: {
//             limit: LIMIT,
//             gtfs_route__date_from: route_date_from,
//             gtfs_route__date_to: route_date_to,
//             gtfs_route__operator_refs: operator_ref,
//             gtfs_route__route_short_name: route_short_name,
//             gtfs_route__route_long_name_contains: route_route_direction,
//           },
//         }).data
//     : EXAMPLE_DATA
//   return data.map((ride) => ({
//     operator_ref: ride.gtfs_route__operator_refs,
//     lineNumber: ride.gtfs_route__route_short_name,
//     direction: ride.gtfs_route__route_long_name_contains,
//     start_time: ride.start_time,
//   })).json()
// }

// const EXAMPLE_DATA: RawRidesList = [
//   {
//     operator_ref: "3",
//     route_short_name: "271",
//     route_route_direction: "תל אביב",
//     route_date_from: "2023-01-01",
//     route_date_to: "2023-01-01",
//   },
//   {
//     operator_ref: "3",
//     route_short_name: "271",
//     route_route_direction: "תל אביב",
//     route_date_from: "2023-01-01",
//     route_date_to: "2023-01-01",
//   }
// ]

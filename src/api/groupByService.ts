import {
  GtfsAgencyPydanticModel,
  GtfsRidesAggGroupByPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import type { Dayjs } from 'src/dayjs'
import { getAgencyList } from './agencyList'
import { AGGREGATIONS_API } from './apiConfig'

type groupByField =
  | 'gtfs_route_date'
  | 'operator_ref'
  | 'day_of_week'
  | 'line_ref'
  | 'gtfs_route_hour'
type groupByFields =
  | groupByField
  | `${groupByField},${groupByField}`
  | `${groupByField},${groupByField},${groupByField}`
  | `${groupByField},${groupByField},${groupByField},${groupByField}`

export type GroupByRes = Omit<GtfsRidesAggGroupByPydanticModel, 'operatorRef'> & {
  operatorRef: GtfsAgencyPydanticModel | undefined
}

async function fetchGroupBy({
  dateTo,
  dateFrom,
  groupBy,
}: {
  dateTo: Dayjs
  dateFrom: Dayjs
  groupBy: groupByFields
}): Promise<GroupByRes[]> {
  const agencies = await getAgencyList()

  // example: https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2023-01-27&date_to=2023-01-29&group_by=operator_ref
  const data = await AGGREGATIONS_API.byGtfsRidesAggGroupByGet({
    dateFrom: dateFrom.toDate(),
    dateTo: dateTo.toDate(),
    groupBy,
    // Exclude 23:00–02:00 IST: SIRI mass-initializes phantom rides for all tracked vehicles at
    // midnight each day, creating hundreds of fake siri_ride records with scheduled_start_time
    // near 00:00. Including them would inflate planned-trip counts and skew on-time statistics.
    excludeHoursFrom: 23,
    excludeHoursTo: 2,
  })

  return data
    .map((data) => {
      const operatorRef = agencies.find((agency) => agency.operatorRef === data.operatorRef)
      return { ...data, operatorRef }
    })
    .filter((data) => data.operatorRef !== undefined)
}
export function useGroupBy({
  dateFrom,
  dateTo,
  groupBy,
}: {
  dateTo: Dayjs
  dateFrom: Dayjs
  groupBy: groupByFields
}) {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['groupBy', dateFrom.toISOString(), dateTo.toISOString(), groupBy],
    queryFn: () => fetchGroupBy({ dateFrom, dateTo, groupBy }),
  })

  return [data ? data : [], isLoading, isError ? error : null] as const
}

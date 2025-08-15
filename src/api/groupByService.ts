import {
  GtfsAgencyPydanticModel,
  GtfsRidesAggGroupByPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import { AGGREGATIONS_API } from './apiConfig'
import { getAgencyList } from './agencyList'

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
  dateTo: number
  dateFrom: number
  groupBy: groupByFields
}): Promise<GroupByRes[]> {
  const agencies = await getAgencyList()

  // example: https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2023-01-27&date_to=2023-01-29&group_by=operator_ref
  const data = await AGGREGATIONS_API.byGtfsRidesAggGroupByGet({
    dateFrom: new Date(dateFrom),
    dateTo: new Date(dateTo),
    groupBy,
    excludeHoursFrom: 23,
    excludeHoursTo: 2,
  })

  return data
    .map((data) => {
      const operatorRef = agencies.find((agency) => agency.operatorRef === data.operatorRef)
      return { ...data, operatorRef } as GroupByRes
    })
    .filter((data) => data.operatorRef !== undefined)
}
export function useGroupBy({
  dateFrom,
  dateTo,
  groupBy,
}: {
  dateTo: number
  dateFrom: number
  groupBy: groupByFields
}) {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['groupBy', dateFrom, dateTo, groupBy],
    queryFn: () => fetchGroupBy({ dateFrom, dateTo, groupBy }),
  })

  return [data ? data : [], isLoading, isError ? error : null] as const
}

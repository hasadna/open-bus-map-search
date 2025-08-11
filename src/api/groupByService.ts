import {
  AggregationsApi,
  GtfsAgencyPydanticModel,
  GtfsRidesAggGroupByPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import getAgencyList from './agencyList'
import { API_CONFIG } from './apiConfig'
import { Dayjs } from 'src/dayjs'

const AGGREGATIONS_API = new AggregationsApi(API_CONFIG)

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
  dateToStr,
  dateFromStr,
  groupBy,
}: {
  dateToStr: string
  dateFromStr: string
  groupBy: groupByFields
}): Promise<GroupByRes[]> {
  const agencies = await getAgencyList()
  // example: https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2023-01-27&date_to=2023-01-29&group_by=operator_ref
  const data = await AGGREGATIONS_API.byGtfsRidesAggGroupByGet({
    dateFrom: new Date(dateFromStr),
    dateTo: new Date(dateToStr),
    groupBy,
    excludeHoursFrom: 23,
    excludeHoursTo: 2,
  })

  return data.map((data) => ({
    ...data,
    operatorRef: agencies.find((agency) => agency.operatorRef === data.operatorRef),
  }))
}

export function useGroupBy({
  dateTo,
  dateFrom,
  groupBy,
}: {
  dateTo: Dayjs
  dateFrom: Dayjs
  groupBy: groupByFields
}) {
  const dateToStr = dateTo.toISOString().split('T')[0]
  const dateFromStr = dateFrom.toISOString().split('T')[0]
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['groupBy', dateToStr, dateFromStr, groupBy],
    queryFn: () => fetchGroupBy({ dateToStr, dateFromStr, groupBy }),
  })

  return [data ? data : [], isLoading, isError ? error : null] as const
}

import {
  GtfsAgencyPydanticModel,
  GtfsRidesAggGroupByPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type CivilDate, civilDateToApiDate } from 'src/model/time/civilDate'
import { agencyListQueryOptions } from './agencyList'
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

export function useGroupBy({
  dateFrom,
  dateTo,
  groupBy,
}: {
  dateTo: CivilDate
  dateFrom: CivilDate
  groupBy: groupByFields
}) {
  // Both operators and rides are asked for the same range, so an operator that stopped
  // running mid-range still gets a name instead of dropping out of the chart.
  const agenciesQuery = useQuery(agencyListQueryOptions(dateFrom, dateTo))
  const ridesQuery = useQuery({
    // example: https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2023-01-27&date_to=2023-01-29&group_by=operator_ref
    queryKey: ['gtfsRidesAggGroupBy', dateFrom, dateTo, groupBy],
    queryFn: () =>
      AGGREGATIONS_API.byGtfsRidesAggGroupByGet({
        dateFrom: civilDateToApiDate(dateFrom),
        dateTo: civilDateToApiDate(dateTo),
        groupBy,
        excludeHoursFrom: 23,
        excludeHoursTo: 2,
      }),
  })

  const data = useMemo<GroupByRes[]>(() => {
    const agencies = agenciesQuery.data
    if (!agencies || !ridesQuery.data) return []
    const agencyByOperatorRef = new Map<number | undefined, GtfsAgencyPydanticModel>(
      agencies.map((agency) => [agency.operatorRef, agency]),
    )

    return ridesQuery.data
      .map((ride) => ({ ...ride, operatorRef: agencyByOperatorRef.get(ride.operatorRef) }))
      .filter((ride) => ride.operatorRef !== undefined)
  }, [ridesQuery.data, agenciesQuery.data])

  const isLoading = ridesQuery.isLoading || agenciesQuery.isLoading
  const error = ridesQuery.error ?? agenciesQuery.error

  return [data, isLoading, error] as const
}

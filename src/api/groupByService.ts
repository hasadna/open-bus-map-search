import { useEffect, useState } from 'react'
import { BASE_PATH } from './apiConfig'
import agencyList from 'open-bus-stride-client/agencies/agencyList'
import { Moment } from 'moment'

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

type Identity<T> = { [P in keyof T]: T[P] }
type Replace<T, K extends keyof T, TReplace> = Identity<
  Pick<T, Exclude<keyof T, K>> & {
    [P in K]: TReplace
  }
>

/*
example response
[
  {
    "gtfs_route_date": "2023-02-27",
    "operator_ref": 0,
    "day_of_week": "string",
    "total_routes": 0,
    "total_planned_rides": 0,
    "total_actual_rides": 0
  }
]
*/
type GroupByResponse = {
  gtfs_route_date: string
  gtfs_route_hour: string
  operator_ref: number
  line_ref: number
  day_of_week: string
  total_routes: number
  total_planned_rides: number
  total_actual_rides: number
  route_short_name: string
  route_long_name: string
}[]

export type GroupByRes = Replace<
  GroupByResponse[0],
  'operator_ref',
  | {
      agency_id: string
      agency_name: string
      agency_url: string
      agency_timezone: string
      agency_lang: string
      agency_phone: string
      agency_fare_url: string
    }
  | undefined
>

async function groupbyAsync({
  dateTo,
  dateFrom,
  groupBy,
}: {
  dateTo: Moment
  dateFrom: Moment
  groupBy: groupByFields
}): Promise<GroupByResponse> {
  // example: https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2023-01-27&date_to=2023-01-29&group_by=operator_ref
  const dateToStr = dateTo.toISOString().split('T')[0]
  const dateFromStr = dateFrom.toISOString().split('T')[0]
  const excludes = 'exclude_hour_from=23&exclude_hour_to=2'
  return (
    await fetch(
      `${BASE_PATH}/gtfs_rides_agg/group_by?date_from=${dateFromStr}&date_to=${dateToStr}&group_by=${groupBy}&${excludes}`,
    )
  ).json()
}

export function useGroupBy({
  dateTo,
  dateFrom,
  groupBy,
}: {
  dateTo: Moment
  dateFrom: Moment
  groupBy: groupByFields
}) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<
    Replace<
      GroupByResponse[0],
      'operator_ref',
      | {
          agency_id: string
          agency_name: string
          agency_url: string
          agency_timezone: string
          agency_lang: string
          agency_phone: string
          agency_fare_url: string
        }
      | undefined
    >[]
  >([])

  useEffect(() => {
    setLoading(true)
    groupbyAsync({ dateTo, dateFrom, groupBy })
      .then((data) => {
        setData(
          data
            .map((dataRecord) => ({
              ...dataRecord,
              operator_ref: agencyList.find(
                (agency) => agency.agency_id === String(dataRecord.operator_ref),
              ),
            }))
            // should filter operator 22 (which is the Dankal TLV light train)
            .filter((dataRecord) => dataRecord.operator_ref !== undefined),
        )
      })
      .catch((er) => setError(er))
      .finally(() => setLoading(false))
  }, [+dateTo, +dateFrom, groupBy])

  return [data, loading, error] as const
}

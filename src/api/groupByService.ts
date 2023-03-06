import { useEffect, useState } from 'react'
import { BASE_PATH } from './apiConfig'
import agencyList from 'open-bus-stride-client/agencies/agencyList'

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
export type GroupByResponse = {
  gtfs_route_date: string
  operator_ref: number
  day_of_week: string
  total_routes: number
  total_planned_rides: number
  total_actual_rides: number
}[]

async function asyncGroupby({
  dateTo,
  dateFrom,
  groupBy,
}: {
  dateTo: Date
  dateFrom: Date
  groupBy: 'gtfs_route_date' | 'operator_ref' | 'day_of_week'
}): Promise<GroupByResponse> {
  // example: https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2023-01-27&date_to=2023-01-29&group_by=operator_ref
  const dateToStr = dateTo.toISOString().split('T')[0]
  const dateFromStr = dateFrom.toISOString().split('T')[0]
  return (
    await fetch(
      `${BASE_PATH}/gtfs_rides_agg/group_by?date_from=${dateFromStr}&date_to=${dateToStr}&group_by=${groupBy}`,
    )
  ).json()
}

export function useGroupBy({
  dateTo,
  dateFrom,
  groupBy,
}: {
  dateTo: Date
  dateFrom: Date
  groupBy: 'gtfs_route_date' | 'operator_ref' | 'day_of_week'
}) {
  const [data, setData] = useState<GroupByResponse>([])

  useEffect(() => {
    asyncGroupby({ dateTo, dateFrom, groupBy }).then((data) => setData(data))
  }, [dateTo, dateFrom, groupBy])

  return data.map((dataRecord) => ({
    ...dataRecord,
    operator_ref: agencyList.find((agency) => agency.agency_id === String(dataRecord.operator_ref)),
  }))
}

export default asyncGroupby

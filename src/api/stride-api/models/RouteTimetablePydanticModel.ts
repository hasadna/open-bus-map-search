/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RouteTimetablePydanticModel = {
  id: number
  name?: string
  city?: string
  lon?: number
  lat?: number
  planned_arrival_time?: string
  gtfs_line_ref?: string
  gtfs_line_start_time?: string
  gtfs_ride_id?: string
}

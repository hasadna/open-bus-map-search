/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SiriRidePydanticModel = {
  id: number
  siri_route_id: number
  journey_ref: string
  scheduled_start_time: string
  vehicle_ref?: string
  updated_first_last_vehicle_locations?: string
  first_vehicle_location_id?: number
  last_vehicle_location_id?: number
  updated_duration_minutes?: string
  duration_minutes?: number
  journey_gtfs_ride_id?: number
  route_gtfs_ride_id?: number
  gtfs_ride_id?: number
}

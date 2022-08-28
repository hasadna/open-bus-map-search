/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SiriRideWithRelatedPydanticModel = {
  id?: number
  siri_route_id?: number
  journey_ref?: string
  scheduled_start_time?: string
  vehicle_ref?: string
  updated_first_last_vehicle_locations?: string
  first_vehicle_location_id?: number
  last_vehicle_location_id?: number
  updated_duration_minutes?: string
  duration_minutes?: number
  journey_gtfs_ride_id?: number
  route_gtfs_ride_id?: number
  gtfs_ride_id?: number
  gtfs_ride__gtfs_route_id?: number
  gtfs_ride__journey_ref?: string
  gtfs_ride__start_time?: string
  gtfs_ride__end_time?: string
  gtfs_route__date?: string
  gtfs_route__line_ref?: number
  gtfs_route__operator_ref?: number
  gtfs_route__route_short_name?: string
  gtfs_route__route_long_name?: string
  gtfs_route__route_mkt?: string
  gtfs_route__route_direction?: string
  gtfs_route__route_alternative?: string
  gtfs_route__agency_name?: string
  gtfs_route__route_type?: string
}

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GtfsRideWithRelatedPydanticModel = {
  id?: number
  gtfs_route_id?: number
  journey_ref?: string
  start_time?: string
  end_time?: string
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

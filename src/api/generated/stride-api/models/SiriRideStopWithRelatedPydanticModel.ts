/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SiriRideStopWithRelatedPydanticModel = {
    id?: number;
    siri_stop_id?: number;
    siri_ride_id?: number;
    order?: number;
    gtfs_stop_id?: number;
    nearest_siri_vehicle_location_id?: number;
    siri_stop__code?: number;
    siri_ride__siri_route_id?: number;
    siri_ride__journey_ref?: string;
    siri_ride__scheduled_start_time?: string;
    siri_ride__vehicle_ref?: string;
    siri_ride__updated_first_last_vehicle_locations?: string;
    siri_ride__first_vehicle_location_id?: number;
    siri_ride__last_vehicle_location_id?: number;
    siri_ride__updated_duration_minutes?: string;
    siri_ride__duration_minutes?: number;
    siri_ride__journey_gtfs_ride_id?: number;
    siri_ride__route_gtfs_ride_id?: number;
    siri_ride__gtfs_ride_id?: number;
    gtfs_stop__date?: string;
    gtfs_stop__code?: number;
    gtfs_stop__lat?: number;
    gtfs_stop__lon?: number;
    gtfs_stop__name?: string;
    gtfs_stop__city?: string;
    nearest_siri_vehicle_location__siri_snapshot_id?: number;
    nearest_siri_vehicle_location__siri_ride_stop_id?: number;
    nearest_siri_vehicle_location__recorded_at_time?: string;
    nearest_siri_vehicle_location__lon?: number;
    nearest_siri_vehicle_location__lat?: number;
    nearest_siri_vehicle_location__bearing?: number;
    nearest_siri_vehicle_location__velocity?: number;
    nearest_siri_vehicle_location__distance_from_journey_start?: number;
    nearest_siri_vehicle_location__distance_from_siri_ride_stop_meters?: number;
    gtfs_ride_stop__gtfs_stop_id?: number;
    gtfs_ride_stop__gtfs_ride_id?: number;
    gtfs_ride_stop__arrival_time?: string;
    gtfs_ride_stop__departure_time?: string;
    gtfs_ride_stop__stop_sequence?: number;
    gtfs_ride_stop__pickup_type?: number;
    gtfs_ride_stop__drop_off_type?: number;
    gtfs_ride_stop__shape_dist_traveled?: number;
    gtfs_ride__gtfs_route_id?: number;
    gtfs_ride__journey_ref?: string;
    gtfs_ride__start_time?: string;
    gtfs_ride__end_time?: string;
    gtfs_route__date?: string;
    gtfs_route__line_ref?: number;
    gtfs_route__operator_ref?: number;
    gtfs_route__route_short_name?: string;
    gtfs_route__route_long_name?: string;
    gtfs_route__route_mkt?: string;
    gtfs_route__route_direction?: string;
    gtfs_route__route_alternative?: string;
    gtfs_route__agency_name?: string;
    gtfs_route__route_type?: string;
};


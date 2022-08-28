/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SiriVehicleLocationWithRelatedPydanticModel = {
    id?: number;
    siri_snapshot_id?: number;
    siri_ride_stop_id?: number;
    recorded_at_time?: string;
    lon?: number;
    lat?: number;
    bearing?: number;
    velocity?: number;
    distance_from_journey_start?: number;
    distance_from_siri_ride_stop_meters?: number;
    siri_snapshot__snapshot_id?: string;
    siri_route__id?: number;
    siri_route__line_ref?: number;
    siri_route__operator_ref?: number;
    siri_ride__id?: number;
    siri_ride__journey_ref?: string;
    siri_ride__scheduled_start_time?: string;
    siri_ride__vehicle_ref?: string;
    siri_ride__first_vehicle_location_id?: number;
    siri_ride__last_vehicle_location_id?: number;
    siri_ride__duration_minutes?: number;
    siri_ride__gtfs_ride_id?: number;
};


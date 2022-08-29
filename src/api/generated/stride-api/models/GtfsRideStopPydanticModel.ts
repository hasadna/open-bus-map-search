/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GtfsRideStopPydanticModel = {
    id: number;
    gtfs_stop_id: number;
    gtfs_ride_id: number;
    arrival_time?: string;
    departure_time?: string;
    stop_sequence?: number;
    pickup_type?: number;
    drop_off_type?: number;
    shape_dist_traveled?: number;
};


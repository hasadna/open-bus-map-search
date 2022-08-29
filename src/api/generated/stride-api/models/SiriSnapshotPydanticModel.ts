/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SiriSnapshotEtlStatusEnum } from './SiriSnapshotEtlStatusEnum';

export type SiriSnapshotPydanticModel = {
    id: number;
    snapshot_id: string;
    etl_status: SiriSnapshotEtlStatusEnum;
    etl_start_time?: string;
    etl_end_time?: string;
    error?: string;
    num_successful_parse_vehicle_locations?: number;
    num_failed_parse_vehicle_locations?: number;
    num_added_siri_rides?: number;
    num_added_siri_ride_stops?: number;
    num_added_siri_routes?: number;
    num_added_siri_stops?: number;
    last_heartbeat?: string;
    created_by?: string;
};


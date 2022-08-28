/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SiriVehicleLocationPydanticModel = {
  id: number
  siri_snapshot_id: number
  siri_ride_stop_id: number
  recorded_at_time: string
  lon: number
  lat: number
  bearing: number
  velocity: number
  distance_from_journey_start: number
  distance_from_siri_ride_stop_meters?: number
}

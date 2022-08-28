/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SiriRidePydanticModel } from '../models/SiriRidePydanticModel';
import type { SiriRideStopPydanticModel } from '../models/SiriRideStopPydanticModel';
import type { SiriRideStopWithRelatedPydanticModel } from '../models/SiriRideStopWithRelatedPydanticModel';
import type { SiriRideWithRelatedPydanticModel } from '../models/SiriRideWithRelatedPydanticModel';
import type { SiriRoutePydanticModel } from '../models/SiriRoutePydanticModel';
import type { SiriSnapshotPydanticModel } from '../models/SiriSnapshotPydanticModel';
import type { SiriStopPydanticModel } from '../models/SiriStopPydanticModel';
import type { SiriVehicleLocationPydanticModel } from '../models/SiriVehicleLocationPydanticModel';
import type { SiriVehicleLocationWithRelatedPydanticModel } from '../models/SiriVehicleLocationWithRelatedPydanticModel';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SiriService {

    /**
     * List
     * List of siri routes.
     * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
     * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
     * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
     * @param lineRefs
     *
     * Filter by line ref. Comma-separated list of values.
     * @param operatorRefs
     *
     * Filter by operator ref. Comma-separated list of values.
     * @param orderBy Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".
     * @returns SiriRoutePydanticModel Successful Response
     * @throws ApiError
     */
    public static listSiriRoutesListGet(
        limit?: number,
        offset?: number,
        getCount: boolean = false,
        lineRefs?: string,
        operatorRefs?: string,
        orderBy: string = 'id asc',
    ): CancelablePromise<Array<SiriRoutePydanticModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_routes/list',
            query: {
                'limit': limit,
                'offset': offset,
                'get_count': getCount,
                'line_refs': lineRefs,
                'operator_refs': operatorRefs,
                'order_by': orderBy,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get
     * Return a single siri route based on id
     * @param id siri route id to get
     * @returns SiriRoutePydanticModel Successful Response
     * @throws ApiError
     */
    public static getSiriRoutesGetGet(
        id: number,
    ): CancelablePromise<SiriRoutePydanticModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_routes/get',
            query: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * List
     * List of siri rides.
     * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
     * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
     * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
     * @param gtfsRouteDateFrom
     *
     * Filter by related gtfs route's date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
     * @param gtfsRouteDateTo
     *
     * Filter by related gtfs route's date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
     * @param gtfsRouteLineRefs
     *
     * Filter by related gtfs route's line ref. Comma-separated list of values.
     * @param gtfsRouteOperatorRefs Agency identifier. To get it, first query gtfs_agencies.
     *
     * Filter by related gtfs route's operator ref. Comma-separated list of values.
     *
     * Example: 3 for Eged
     * @param gtfsRouteRouteShortName Line number.
     *
     * Filter by related gtfs route's route short name. Only return items which exactly match given string.
     *
     * Example: 480
     * @param gtfsRouteRouteLongNameContains
     *
     * Filter by related gtfs route's route long name. Only return items which contain given string.
     * @param gtfsRouteRouteMkt
     *
     * Filter by related gtfs route's route mkt. Only return items which exactly match given string.
     * @param gtfsRouteRouteDirection
     *
     * Filter by related gtfs route's route direction. Only return items which exactly match given string.
     * @param gtfsRouteRouteAlternative
     *
     * Filter by related gtfs route's route alternative. Only return items which exactly match given string.
     * @param gtfsRouteAgencyName
     *
     * Filter by related gtfs route's agency name. Only return items which exactly match given string.
     * @param gtfsRouteRouteType
     *
     * Filter by related gtfs route's route type. Only return items which exactly match given string.
     * @param gtfsRideGtfsRouteId
     *
     * Filter by related gtfs ride's gtfs route id. Only return items which exactly match given string.
     * @param gtfsRideJourneyRefPrefix
     *
     * Filter by related gtfs ride's journey ref prefix. Only return items which start with given string.
     * @param gtfsRideStartTimeFrom
     *
     * Filter by related gtfs ride's start time from. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param gtfsRideStartTimeTo
     *
     * Filter by related gtfs ride's start time to. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param siriRouteIds
     *
     * Filter by siri route ids. Comma-separated list of values.
     * @param siriRouteLineRefs
     *
     * Filter by siri route line refs. Comma-separated list of values.
     * @param siriRouteOperatorRefs
     *
     * Filter by siri route operator refs. Comma-separated list of values.
     * @param journeyRefPrefix
     *
     * Filter by journey ref prefix. Only return items which start with given string.
     * @param journeyRefs
     *
     * Filter by journey ref. Comma-separated list of values.
     * @param vehicleRefs
     *
     * Filter by vehicle ref. Comma-separated list of values.
     * @param scheduledStartTimeFrom
     *
     * Filter by scheduled start time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param scheduledStartTimeTo
     *
     * Filter by scheduled start time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param orderBy Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".
     * @returns SiriRideWithRelatedPydanticModel Successful Response
     * @throws ApiError
     */
    public static listSiriRidesListGet(
        limit?: number,
        offset?: number,
        getCount: boolean = false,
        gtfsRouteDateFrom?: string,
        gtfsRouteDateTo?: string,
        gtfsRouteLineRefs?: string,
        gtfsRouteOperatorRefs?: string,
        gtfsRouteRouteShortName?: string,
        gtfsRouteRouteLongNameContains?: string,
        gtfsRouteRouteMkt?: string,
        gtfsRouteRouteDirection?: string,
        gtfsRouteRouteAlternative?: string,
        gtfsRouteAgencyName?: string,
        gtfsRouteRouteType?: string,
        gtfsRideGtfsRouteId?: number,
        gtfsRideJourneyRefPrefix?: string,
        gtfsRideStartTimeFrom?: string,
        gtfsRideStartTimeTo?: string,
        siriRouteIds?: string,
        siriRouteLineRefs?: string,
        siriRouteOperatorRefs?: string,
        journeyRefPrefix?: string,
        journeyRefs?: string,
        vehicleRefs?: string,
        scheduledStartTimeFrom?: string,
        scheduledStartTimeTo?: string,
        orderBy: string = 'id asc',
    ): CancelablePromise<Array<SiriRideWithRelatedPydanticModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_rides/list',
            query: {
                'limit': limit,
                'offset': offset,
                'get_count': getCount,
                'gtfs_route__date_from': gtfsRouteDateFrom,
                'gtfs_route__date_to': gtfsRouteDateTo,
                'gtfs_route__line_refs': gtfsRouteLineRefs,
                'gtfs_route__operator_refs': gtfsRouteOperatorRefs,
                'gtfs_route__route_short_name': gtfsRouteRouteShortName,
                'gtfs_route__route_long_name_contains': gtfsRouteRouteLongNameContains,
                'gtfs_route__route_mkt': gtfsRouteRouteMkt,
                'gtfs_route__route_direction': gtfsRouteRouteDirection,
                'gtfs_route__route_alternative': gtfsRouteRouteAlternative,
                'gtfs_route__agency_name': gtfsRouteAgencyName,
                'gtfs_route__route_type': gtfsRouteRouteType,
                'gtfs_ride__gtfs_route_id': gtfsRideGtfsRouteId,
                'gtfs_ride__journey_ref_prefix': gtfsRideJourneyRefPrefix,
                'gtfs_ride__start_time_from': gtfsRideStartTimeFrom,
                'gtfs_ride__start_time_to': gtfsRideStartTimeTo,
                'siri_route_ids': siriRouteIds,
                'siri_route__line_refs': siriRouteLineRefs,
                'siri_route__operator_refs': siriRouteOperatorRefs,
                'journey_ref_prefix': journeyRefPrefix,
                'journey_refs': journeyRefs,
                'vehicle_refs': vehicleRefs,
                'scheduled_start_time_from': scheduledStartTimeFrom,
                'scheduled_start_time_to': scheduledStartTimeTo,
                'order_by': orderBy,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get
     * Return a single siri ride based on id
     * @param id siri ride id to get
     * @returns SiriRidePydanticModel Successful Response
     * @throws ApiError
     */
    public static getSiriRidesGetGet(
        id: number,
    ): CancelablePromise<SiriRidePydanticModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_rides/get',
            query: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * List
     * List of siri stops.
     * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
     * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
     * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
     * @param codes
     *
     * Filter by stop code. Comma-separated list of values.
     * @param orderBy Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".
     * @returns SiriStopPydanticModel Successful Response
     * @throws ApiError
     */
    public static listSiriStopsListGet(
        limit?: number,
        offset?: number,
        getCount: boolean = false,
        codes?: string,
        orderBy: string = 'id asc',
    ): CancelablePromise<Array<SiriStopPydanticModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_stops/list',
            query: {
                'limit': limit,
                'offset': offset,
                'get_count': getCount,
                'codes': codes,
                'order_by': orderBy,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get
     * Return a single siri stop based on id
     * @param id siri stop id to get
     * @returns SiriStopPydanticModel Successful Response
     * @throws ApiError
     */
    public static getSiriStopsGetGet(
        id: number,
    ): CancelablePromise<SiriStopPydanticModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_stops/get',
            query: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * List
     * List of siri ride stops.
     * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
     * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
     * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
     * @param siriStopIds
     *
     * Filter by siri stop id. Comma-separated list of values.
     * @param siriRideIds
     *
     * Filter by siri ride id. Comma-separated list of values.
     * @param siriVehicleLocationLonGreaterOrEqual
     *
     * Filter by siri vehicle location lon. Only return items which have a numeric value greater than or equal to given value
     *
     * Example: 34.808
     * @param siriVehicleLocationLonLowerOrEqual
     *
     * Filter by siri vehicle location lon. Only return items which have a numeric value lower than or equal to given value
     *
     * Example: 34.808
     * @param siriVehicleLocationLatGreaterOrEqual
     *
     * Filter by siri vehicle location lat. Only return items which have a numeric value greater than or equal to given value
     *
     * Example: 31.961
     * @param siriVehicleLocationLatLowerOrEqual
     *
     * Filter by siri vehicle location lat. Only return items which have a numeric value lower than or equal to given value
     *
     * Example: 31.961
     * @param siriVehicleLocationRecordedAtTimeFrom
     *
     * Filter by siri vehicle location recorded at time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param siriVehicleLocationRecordedAtTimeTo
     *
     * Filter by siri vehicle location recorded at time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param siriRideScheduledStartTimeFrom
     *
     * Filter by siri ride scheduled start time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param siriRideScheduledStartTimeTo
     *
     * Filter by siri ride scheduled start time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param gtfsStopLatGreaterOrEqual
     *
     * Filter by gtfs stop lat. Only return items which have a numeric value greater than or equal to given value
     *
     * Example: 31.961
     * @param gtfsStopLatLowerOrEqual
     *
     * Filter by gtfs stop lat. Only return items which have a numeric value lower than or equal to given value
     *
     * Example: 31.961
     * @param gtfsStopLonGreaterOrEqual
     *
     * Filter by gtfs stop lon. Only return items which have a numeric value greater than or equal to given value
     *
     * Example: 34.808
     * @param gtfsStopLonLowerOrEqual
     *
     * Filter by gtfs stop lon. Only return items which have a numeric value lower than or equal to given value
     *
     * Example: 34.808
     * @param gtfsDateFrom filter all gtfs related records on this date
     *
     * Filter by gtfs date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
     * @param gtfsDateTo filter all gtfs related records on this date
     *
     * Filter by gtfs date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
     * @param orderBy Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".
     * @returns SiriRideStopWithRelatedPydanticModel Successful Response
     * @throws ApiError
     */
    public static listSiriRideStopsListGet(
        limit?: number,
        offset?: number,
        getCount: boolean = false,
        siriStopIds?: string,
        siriRideIds?: string,
        siriVehicleLocationLonGreaterOrEqual?: number,
        siriVehicleLocationLonLowerOrEqual?: number,
        siriVehicleLocationLatGreaterOrEqual?: number,
        siriVehicleLocationLatLowerOrEqual?: number,
        siriVehicleLocationRecordedAtTimeFrom?: string,
        siriVehicleLocationRecordedAtTimeTo?: string,
        siriRideScheduledStartTimeFrom?: string,
        siriRideScheduledStartTimeTo?: string,
        gtfsStopLatGreaterOrEqual?: number,
        gtfsStopLatLowerOrEqual?: number,
        gtfsStopLonGreaterOrEqual?: number,
        gtfsStopLonLowerOrEqual?: number,
        gtfsDateFrom?: string,
        gtfsDateTo?: string,
        orderBy: string = '',
    ): CancelablePromise<Array<SiriRideStopWithRelatedPydanticModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_ride_stops/list',
            query: {
                'limit': limit,
                'offset': offset,
                'get_count': getCount,
                'siri_stop_ids': siriStopIds,
                'siri_ride_ids': siriRideIds,
                'siri_vehicle_location__lon__greater_or_equal': siriVehicleLocationLonGreaterOrEqual,
                'siri_vehicle_location__lon__lower_or_equal': siriVehicleLocationLonLowerOrEqual,
                'siri_vehicle_location__lat__greater_or_equal': siriVehicleLocationLatGreaterOrEqual,
                'siri_vehicle_location__lat__lower_or_equal': siriVehicleLocationLatLowerOrEqual,
                'siri_vehicle_location__recorded_at_time_from': siriVehicleLocationRecordedAtTimeFrom,
                'siri_vehicle_location__recorded_at_time_to': siriVehicleLocationRecordedAtTimeTo,
                'siri_ride__scheduled_start_time_from': siriRideScheduledStartTimeFrom,
                'siri_ride__scheduled_start_time_to': siriRideScheduledStartTimeTo,
                'gtfs_stop__lat__greater_or_equal': gtfsStopLatGreaterOrEqual,
                'gtfs_stop__lat__lower_or_equal': gtfsStopLatLowerOrEqual,
                'gtfs_stop__lon__greater_or_equal': gtfsStopLonGreaterOrEqual,
                'gtfs_stop__lon__lower_or_equal': gtfsStopLonLowerOrEqual,
                'gtfs_date_from': gtfsDateFrom,
                'gtfs_date_to': gtfsDateTo,
                'order_by': orderBy,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get
     * Return a single siri ride stop based on id
     * @param id siri ride stop id to get
     * @returns SiriRideStopPydanticModel Successful Response
     * @throws ApiError
     */
    public static getSiriRideStopsGetGet(
        id: number,
    ): CancelablePromise<SiriRideStopPydanticModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_ride_stops/get',
            query: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * List
     * List of siri vehicle locations.
     * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
     * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
     * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
     * @param siriVehicleLocationIds
     *
     * Filter by siri vehicle location id. Comma-separated list of values.
     * @param siriSnapshotIds
     *
     * Filter by siri snapshot id. Comma-separated list of values.
     * @param siriRideStopIds
     *
     * Filter by siri ride stop id. Comma-separated list of values.
     * @param recordedAtTimeFrom
     *
     * Filter by recorded at time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param recordedAtTimeTo
     *
     * Filter by recorded at time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param lonGreaterOrEqual
     *
     * Filter by lon. Only return items which have a numeric value greater than or equal to given value
     *
     * Example: 34.808
     * @param lonLowerOrEqual
     *
     * Filter by lon. Only return items which have a numeric value lower than or equal to given value
     *
     * Example: 34.808
     * @param latGreaterOrEqual
     *
     * Filter by lat. Only return items which have a numeric value greater than or equal to given value
     *
     * Example: 31.961
     * @param latLowerOrEqual
     *
     * Filter by lat. Only return items which have a numeric value lower than or equal to given value
     *
     * Example: 31.961
     * @param orderBy Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".
     * @param siriRoutesLineRef
     *
     * Filter by siri route line ref. Only return items which exactly match given string.
     * @param siriRoutesOperatorRef
     *
     * Filter by siri route operator ref. Only return items which exactly match given string.
     * @param siriRidesSchedualedStartTimeFrom
     *
     * Filter by siri ride scheduled start time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param siriRidesSchedualedStartTimeTo
     *
     * Filter by siri ride scheduled start time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param siriRidesIds
     *
     * Filter by siri ride id. Comma-separated list of values.
     * @param siriRoutesIds
     *
     * Filter by siri route id. Comma-separated list of values.
     * @returns SiriVehicleLocationWithRelatedPydanticModel Successful Response
     * @throws ApiError
     */
    public static listSiriVehicleLocationsListGet(
        limit?: number,
        offset?: number,
        getCount: boolean = false,
        siriVehicleLocationIds?: string,
        siriSnapshotIds?: string,
        siriRideStopIds?: string,
        recordedAtTimeFrom?: string,
        recordedAtTimeTo?: string,
        lonGreaterOrEqual?: number,
        lonLowerOrEqual?: number,
        latGreaterOrEqual?: number,
        latLowerOrEqual?: number,
        orderBy: string = 'id asc',
        siriRoutesLineRef?: string,
        siriRoutesOperatorRef?: string,
        siriRidesSchedualedStartTimeFrom?: string,
        siriRidesSchedualedStartTimeTo?: string,
        siriRidesIds?: string,
        siriRoutesIds?: string,
    ): CancelablePromise<Array<SiriVehicleLocationWithRelatedPydanticModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_vehicle_locations/list',
            query: {
                'limit': limit,
                'offset': offset,
                'get_count': getCount,
                'siri_vehicle_location_ids': siriVehicleLocationIds,
                'siri_snapshot_ids': siriSnapshotIds,
                'siri_ride_stop_ids': siriRideStopIds,
                'recorded_at_time_from': recordedAtTimeFrom,
                'recorded_at_time_to': recordedAtTimeTo,
                'lon__greater_or_equal': lonGreaterOrEqual,
                'lon__lower_or_equal': lonLowerOrEqual,
                'lat__greater_or_equal': latGreaterOrEqual,
                'lat__lower_or_equal': latLowerOrEqual,
                'order_by': orderBy,
                'siri_routes__line_ref': siriRoutesLineRef,
                'siri_routes__operator_ref': siriRoutesOperatorRef,
                'siri_rides__schedualed_start_time_from': siriRidesSchedualedStartTimeFrom,
                'siri_rides__schedualed_start_time_to': siriRidesSchedualedStartTimeTo,
                'siri_rides__ids': siriRidesIds,
                'siri_routes__ids': siriRoutesIds,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get
     * Return a single siri vehicle location based on id
     * @param id siri vehicle location id to get
     * @returns SiriVehicleLocationPydanticModel Successful Response
     * @throws ApiError
     */
    public static getSiriVehicleLocationsGetGet(
        id: number,
    ): CancelablePromise<SiriVehicleLocationPydanticModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_vehicle_locations/get',
            query: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * List
     * List of siri snapshots.
     * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
     * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
     * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
     * @param snapshotIdPrefix
     *
     * Filter by snapshot id prefix. Only return items which start with given string.
     * @param orderBy Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".
     * @returns SiriSnapshotPydanticModel Successful Response
     * @throws ApiError
     */
    public static listSiriSnapshotsListGet(
        limit?: number,
        offset?: number,
        getCount: boolean = false,
        snapshotIdPrefix?: string,
        orderBy: string = 'id asc',
    ): CancelablePromise<Array<SiriSnapshotPydanticModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_snapshots/list',
            query: {
                'limit': limit,
                'offset': offset,
                'get_count': getCount,
                'snapshot_id_prefix': snapshotIdPrefix,
                'order_by': orderBy,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get
     * Return a single siri snapshot based on id
     * @param id siri snapshot id to get
     * @returns SiriSnapshotPydanticModel Successful Response
     * @throws ApiError
     */
    public static getSiriSnapshotsGetGet(
        id: number,
    ): CancelablePromise<SiriSnapshotPydanticModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/siri_snapshots/get',
            query: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}

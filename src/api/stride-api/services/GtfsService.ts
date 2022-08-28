/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GtfsAgencyPydanticModel } from '../models/GtfsAgencyPydanticModel'
import type { GtfsRidePydanticModel } from '../models/GtfsRidePydanticModel'
import type { GtfsRideStopPydanticModel } from '../models/GtfsRideStopPydanticModel'
import type { GtfsRideWithRelatedPydanticModel } from '../models/GtfsRideWithRelatedPydanticModel'
import type { GtfsRoutePydanticModel } from '../models/GtfsRoutePydanticModel'
import type { GtfsStopPydanticModel } from '../models/GtfsStopPydanticModel'

import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

export class GtfsService {
  /**
   * List
   * List of gtfs routes.
   * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
   * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
   * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
   * @param dateFrom
   *
   * Filter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
   * @param dateTo
   *
   * Filter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
   * @param lineRefs
   *
   * Filter by line ref. Comma-separated list of values.
   * @param operatorRefs Agency identifier. To get it, first query gtfs_agencies.
   *
   * Filter by operator ref. Comma-separated list of values.
   *
   * Example: 3 for Eged
   * @param routeShortName Line number.
   *
   * Filter by route short name. Only return items which exactly match given string.
   *
   * Example: 480
   * @param routeLongNameContains
   *
   * Filter by route long name. Only return items which contain given string.
   * @param routeMkt
   *
   * Filter by route mkt. Only return items which exactly match given string.
   * @param routeDirection
   *
   * Filter by route direction. Only return items which exactly match given string.
   * @param routeAlternative
   *
   * Filter by route alternative. Only return items which exactly match given string.
   * @param agencyName
   *
   * Filter by agency name. Only return items which exactly match given string.
   * @param routeType
   *
   * Filter by route type. Only return items which exactly match given string.
   * @param orderBy Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".
   * @returns GtfsRoutePydanticModel Successful Response
   * @throws ApiError
   */
  public static listGtfsRoutesListGet(
    limit?: number,
    offset?: number,
    getCount: boolean = false,
    dateFrom?: string,
    dateTo?: string,
    lineRefs?: string,
    operatorRefs?: string,
    routeShortName?: string,
    routeLongNameContains?: string,
    routeMkt?: string,
    routeDirection?: string,
    routeAlternative?: string,
    agencyName?: string,
    routeType?: string,
    orderBy: string = 'id asc',
  ): CancelablePromise<Array<GtfsRoutePydanticModel>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_routes/list',
      query: {
        limit: limit,
        offset: offset,
        get_count: getCount,
        date_from: dateFrom,
        date_to: dateTo,
        line_refs: lineRefs,
        operator_refs: operatorRefs,
        route_short_name: routeShortName,
        route_long_name_contains: routeLongNameContains,
        route_mkt: routeMkt,
        route_direction: routeDirection,
        route_alternative: routeAlternative,
        agency_name: agencyName,
        route_type: routeType,
        order_by: orderBy,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Get
   * Return a single gtfs route based on id
   * @param id gtfs route id to get
   * @returns GtfsRoutePydanticModel Successful Response
   * @throws ApiError
   */
  public static getGtfsRoutesGetGet(id: number): CancelablePromise<GtfsRoutePydanticModel> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_routes/get',
      query: {
        id: id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * List
   * List of gtfs stops.
   * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
   * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
   * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
   * @param dateFrom
   *
   * Filter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
   * @param dateTo
   *
   * Filter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
   * @param code
   *
   * Filter by code. Only return items which exactly match given string.
   * @param city
   *
   * Filter by city. Only return items which exactly match given string.
   * @returns GtfsStopPydanticModel Successful Response
   * @throws ApiError
   */
  public static listGtfsStopsListGet(
    limit?: number,
    offset?: number,
    getCount: boolean = false,
    dateFrom?: string,
    dateTo?: string,
    code?: number,
    city?: string,
  ): CancelablePromise<Array<GtfsStopPydanticModel>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_stops/list',
      query: {
        limit: limit,
        offset: offset,
        get_count: getCount,
        date_from: dateFrom,
        date_to: dateTo,
        code: code,
        city: city,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Get
   * Return a single gtfs stop based on id
   * @param id gtfs stop id to get
   * @returns GtfsStopPydanticModel Successful Response
   * @throws ApiError
   */
  public static getGtfsStopsGetGet(id: number): CancelablePromise<GtfsStopPydanticModel> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_stops/get',
      query: {
        id: id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * List
   * List of gtfs rides.
   * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
   * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
   * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
   * @param gtfsRouteId
   *
   * Filter by gtfs route id. Only return items which exactly match given string.
   * @param journeyRefPrefix
   *
   * Filter by journey ref prefix. Only return items which start with given string.
   * @param startTimeFrom
   *
   * Filter by start time from. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
   * @param startTimeTo
   *
   * Filter by start time to. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
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
   * @param orderBy Order of the results. Comma-separated list of fields and direction. e.g. "field1 asc,field2 desc".
   * @returns GtfsRideWithRelatedPydanticModel Successful Response
   * @throws ApiError
   */
  public static listGtfsRidesListGet(
    limit?: number,
    offset?: number,
    getCount: boolean = false,
    gtfsRouteId?: number,
    journeyRefPrefix?: string,
    startTimeFrom?: string,
    startTimeTo?: string,
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
    orderBy: string = 'id asc',
  ): CancelablePromise<Array<GtfsRideWithRelatedPydanticModel>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_rides/list',
      query: {
        limit: limit,
        offset: offset,
        get_count: getCount,
        gtfs_route_id: gtfsRouteId,
        journey_ref_prefix: journeyRefPrefix,
        start_time_from: startTimeFrom,
        start_time_to: startTimeTo,
        gtfs_route__date_from: gtfsRouteDateFrom,
        gtfs_route__date_to: gtfsRouteDateTo,
        gtfs_route__line_refs: gtfsRouteLineRefs,
        gtfs_route__operator_refs: gtfsRouteOperatorRefs,
        gtfs_route__route_short_name: gtfsRouteRouteShortName,
        gtfs_route__route_long_name_contains: gtfsRouteRouteLongNameContains,
        gtfs_route__route_mkt: gtfsRouteRouteMkt,
        gtfs_route__route_direction: gtfsRouteRouteDirection,
        gtfs_route__route_alternative: gtfsRouteRouteAlternative,
        gtfs_route__agency_name: gtfsRouteAgencyName,
        gtfs_route__route_type: gtfsRouteRouteType,
        order_by: orderBy,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Get
   * Return a single gtfs ride based on id
   * @param id gtfs ride id to get
   * @returns GtfsRidePydanticModel Successful Response
   * @throws ApiError
   */
  public static getGtfsRidesGetGet(id: number): CancelablePromise<GtfsRidePydanticModel> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_rides/get',
      query: {
        id: id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * List
   * List of gtfs agencies.
   * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
   * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
   * @param dateFrom
   *
   * Filter by date. Only return items which have a date after or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
   * @param dateTo
   *
   * Filter by date. Only return items which have a date before or equals to given value. Format: "YYYY-MM-DD", e.g. "2021-11-03".
   * @returns GtfsAgencyPydanticModel Successful Response
   * @throws ApiError
   */
  public static listGtfsAgenciesListGet(
    limit?: number,
    offset?: number,
    dateFrom?: string,
    dateTo?: string,
  ): CancelablePromise<Array<GtfsAgencyPydanticModel>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_agencies/list',
      query: {
        limit: limit,
        offset: offset,
        date_from: dateFrom,
        date_to: dateTo,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * List
   * List of gtfs ride stops.
   * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
   * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
   * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
   * @param gtfsStopIds
   *
   * Filter by gtfs stop id. Comma-separated list of values.
   * @param gtfsRideIds
   *
   * Filter by gtfs ride id. Comma-separated list of values.
   * @returns GtfsRideStopPydanticModel Successful Response
   * @throws ApiError
   */
  public static listGtfsRideStopsListGet(
    limit?: number,
    offset?: number,
    getCount: boolean = false,
    gtfsStopIds?: string,
    gtfsRideIds?: string,
  ): CancelablePromise<Array<GtfsRideStopPydanticModel>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_ride_stops/list',
      query: {
        limit: limit,
        offset: offset,
        get_count: getCount,
        gtfs_stop_ids: gtfsStopIds,
        gtfs_ride_ids: gtfsRideIds,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Get
   * Return a single gtfs ride stop based on id
   * @param id gtfs ride stop id to get
   * @returns GtfsRideStopPydanticModel Successful Response
   * @throws ApiError
   */
  public static getGtfsRideStopsGetGet(id: number): CancelablePromise<GtfsRideStopPydanticModel> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/gtfs_ride_stops/get',
      query: {
        id: id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RouteTimetablePydanticModel } from '../models/RouteTimetablePydanticModel';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserCasesService {

    /**
     * List
     * List of the stops timetable of a given bus.
     * Currently, only planned time (gtfs) is returned for every stop.
     * @param limit Limit the number of returned results. If not specified will limit to 100 results. To get more results, you can either use the offset param, alternatively - set the limit to -1 and use http streaming with compatible json streaming decoder to get all results, this method can fetch up to a maximum of 500000 results.
     * @param offset Item number to start returning results from. Use in combination with limit for pagination, alternatively, don't set offset, set limit to -1 and use http streaming with compatible json streaming decoder to get all results up to a maximum of 500000 results.
     * @param getCount Set to "true" to only get the total number of results for given filters. limit/offset/order parameters will be ignored.
     * @param plannedStartTimeDateFrom Set a time range to get the timetable of a specific ride
     *
     * Filter by planned_start_time. Only return items which have date/time after or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param plannedStartTimeDateTo Set a time range to get the time table of a specific ride
     *
     * Filter by planned_start_time. Only return items which have date/time before or equals to given value. Format: "YYYY-MM-DDTHH:MM:SS+Z", e.g. "2021-11-03T55:48:49+02:00". Note that all date/times must have a timezone specification.
     * @param lineRefs To get a line ref, first query gtfs_routes
     *
     * Filter by line_ref. Comma-separated list of values.
     * @returns RouteTimetablePydanticModel Successful Response
     * @throws ApiError
     */
    public static listRouteTimetableListGet(
        limit?: number,
        offset?: number,
        getCount: boolean = false,
        plannedStartTimeDateFrom?: string,
        plannedStartTimeDateTo?: string,
        lineRefs?: string,
    ): CancelablePromise<Array<RouteTimetablePydanticModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/route_timetable/list',
            query: {
                'limit': limit,
                'offset': offset,
                'get_count': getCount,
                'planned_start_time_date_from': plannedStartTimeDateFrom,
                'planned_start_time_date_to': plannedStartTimeDateTo,
                'line_refs': lineRefs,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}

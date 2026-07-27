import type {
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import { GTFS_API, SIRI_API } from 'src/api/apiConfig'
import { API_PAGE_SIZE, getTrainDateRange, groupTrainRoutes, TRAIN_OPERATOR_REF } from './trainData'

async function fetchAllPages<T>(fetchPage: (offset: number) => Promise<T[]>) {
  const results: T[] = []

  for (let offset = 0; ; offset += API_PAGE_SIZE) {
    const page = await fetchPage(offset)
    results.push(...page)
    if (page.length < API_PAGE_SIZE) return results
  }
}

export function useTrainRoutes(date: string) {
  return useQuery({
    queryKey: ['train', 'routes', date],
    queryFn: async ({ signal }) => {
      const { dateFrom, dateTo } = getTrainDateRange(date)
      const routes = await fetchAllPages<GtfsRoutePydanticModel>((offset) =>
        GTFS_API.gtfsRoutesListGet(
          {
            getCount: false,
            dateFrom,
            dateTo,
            operatorRefs: TRAIN_OPERATOR_REF,
            orderBy: 'route_long_name asc',
            limit: API_PAGE_SIZE,
            offset,
          },
          { signal },
        ),
      )
      return groupTrainRoutes(routes)
    },
  })
}

export function useTrainRideStops(date: string, lineRefs: number[]) {
  const lineRefsKey = lineRefs.join(',')

  return useQuery({
    queryKey: ['train', 'ride-stops', date, lineRefsKey],
    enabled: lineRefs.length > 0,
    queryFn: ({ signal }) => {
      const { dateFrom, dateTo, timeFrom, timeTo } = getTrainDateRange(date)
      return fetchAllPages<GtfsRideStopWithRelatedPydanticModel>((offset) =>
        GTFS_API.gtfsRideStopsListGet(
          {
            getCount: false,
            arrivalTimeFrom: timeFrom,
            arrivalTimeTo: timeTo,
            gtfsRouteDateFrom: dateFrom,
            gtfsRouteDateTo: dateTo,
            gtfsRouteLineRefs: lineRefsKey,
            gtfsRouteOperatorRefs: TRAIN_OPERATOR_REF,
            orderBy: 'arrival_time asc',
            limit: API_PAGE_SIZE,
            offset,
          },
          { signal },
        ),
      )
    },
  })
}

export function useTrainVehicleLocations(date: string, lineRefs: number[]) {
  const lineRefsKey = lineRefs.join(',')

  return useQuery({
    queryKey: ['train', 'vehicle-locations', date, lineRefsKey],
    enabled: lineRefs.length > 0,
    queryFn: async ({ signal }) => {
      const { timeFrom, timeTo } = getTrainDateRange(date)
      const locationsByLine = await Promise.all(
        lineRefs.map((lineRef) =>
          fetchAllPages<SiriVehicleLocationWithRelatedPydanticModel>((offset) =>
            SIRI_API.siriVehicleLocationsListGet(
              {
                getCount: false,
                siriRoutesLineRef: lineRef.toString(),
                siriRoutesOperatorRef: TRAIN_OPERATOR_REF,
                siriRidesSchedualedStartTimeFrom: timeFrom,
                siriRidesSchedualedStartTimeTo: timeTo,
                orderBy: 'recorded_at_time asc',
                limit: API_PAGE_SIZE,
                offset,
              },
              { signal },
            ),
          ),
        ),
      )
      return locationsByLine.flat()
    },
  })
}

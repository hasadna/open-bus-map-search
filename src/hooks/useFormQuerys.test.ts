import type {
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRideWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
} from '@hasadna/open-bus-api-client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GTFS_API } from 'src/api/apiConfig'
import {
  deduplicateStopsByCode,
  fetchAllPages,
  fetchBoardingStations,
  fetchStopsForRouteVariants,
} from './useFormQuerys'

afterEach(() => vi.restoreAllMocks())

describe('complaint station query helpers', () => {
  it('uses a matching recent route when the selected date has no timed stops', async () => {
    const route = {
      id: 9701285,
      date: new Date('2026-10-07T12:00:00Z'),
      lineRef: 19749,
      operatorRef: 3,
      routeShortName: '1',
      routeMkt: '30001',
      routeDirection: '2',
      routeAlternative: '#',
    } as GtfsRoutePydanticModel
    const previousRoute = {
      ...route,
      id: 9694820,
      date: new Date('2026-10-06T12:00:00Z'),
    }
    const listRides = vi
      .spyOn(GTFS_API, 'gtfsRidesListGet')
      .mockImplementation((request) =>
        Promise.resolve(request?.gtfsRouteId === route.id ? [{ id: 1 }] : [{ id: 2 }]),
      )
    const listStops = vi
      .spyOn(GTFS_API, 'gtfsRideStopsListGet')
      .mockImplementation((request) =>
        Promise.resolve(
          request?.gtfsRideIds === '1' ? [] : [{ gtfsRideId: 2, gtfsStopCode: 43089 }],
        ),
      )
    const listRoutes = vi.spyOn(GTFS_API, 'gtfsRoutesListGet').mockResolvedValue([previousRoute])

    await expect(fetchBoardingStations(route)).resolves.toMatchObject([{ gtfsStopCode: 43089 }])
    expect(listRoutes).toHaveBeenCalledWith(
      expect.objectContaining({
        lineRefs: '19749',
        operatorRefs: '3',
        routeMkt: '30001',
        routeDirection: '2',
        routeAlternative: '#',
        orderBy: 'date desc',
      }),
    )
    expect(listRides).toHaveBeenCalledTimes(2)
    expect(listStops.mock.calls[0][0]).toMatchObject({
      gtfsRideIds: '1',
      arrivalTimeFrom: expect.any(Date),
      arrivalTimeTo: expect.any(Date),
    })
    expect(listStops.mock.calls[1][0]?.gtfsRideIds).toBe('2')
  })

  it('loads every page of route stops', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const fetchPage = vi.fn(async (offset: number, limit: number) => {
      const rows = ['ride A stop', 'ride B stop', 'ride C stop']
      return rows.slice(offset, offset + limit)
    })

    await expect(fetchAllPages(fetchPage, 2)).resolves.toEqual([
      'ride A stop',
      'ride B stop',
      'ride C stop',
    ])
    expect(fetchPage.mock.calls).toEqual([
      [0, 2],
      [2, 2],
    ])
  })

  it('keeps one option per stop code across trip variants', () => {
    const fromEarlyRide = { gtfsStopCode: 101, gtfsStopName: 'Central' }
    const fromLaterRide = { gtfsStopCode: 101, gtfsStopName: 'Central (variant)' }
    const additionalStop = { gtfsStopCode: 202, gtfsStopName: 'Harbor' }
    const stops = deduplicateStopsByCode([
      fromEarlyRide,
      fromLaterRide,
      additionalStop,
    ] as GtfsRideStopWithRelatedPydanticModel[])

    expect(stops).toEqual([fromEarlyRide, additionalStop])
  })

  it('loads stops for every paginated ride variant in bounded, paginated ID batches', async () => {
    const rides = [{ id: 1 }, { id: 2 }, { id: 3 }] as GtfsRideWithRelatedPydanticModel[]
    const stopsByRideIds: Record<string, GtfsRideStopWithRelatedPydanticModel[]> = {
      '1,2': [
        { gtfsRideId: 1, gtfsStopCode: 101 },
        { gtfsRideId: 1, gtfsStopCode: 202 },
        { gtfsRideId: 2, gtfsStopCode: 202 },
      ],
      '3': [
        { gtfsRideId: 3, gtfsStopCode: 202 },
        { gtfsRideId: 3, gtfsStopCode: 303 },
      ],
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    const listRides = vi.fn(async (offset: number, limit: number) =>
      rides.slice(offset, offset + limit),
    )
    // eslint-disable-next-line @typescript-eslint/require-await
    const listRideStops = vi.fn(async (rideIds: number[], offset: number, limit: number) =>
      stopsByRideIds[rideIds.join(',')].slice(offset, offset + limit),
    )

    const stops = await fetchStopsForRouteVariants(listRides, listRideStops, 2, 2)

    expect(listRides.mock.calls).toEqual([
      [0, 2],
      [2, 2],
    ])
    expect(listRideStops.mock.calls).toEqual([
      [[1, 2], 0, 2],
      [[1, 2], 2, 2],
      [[3], 0, 2],
      [[3], 2, 2],
    ])
    expect(stops.map((stop) => stop.gtfsStopCode)).toEqual([101, 202, 303])
  })
})

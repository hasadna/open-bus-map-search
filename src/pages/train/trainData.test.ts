import type {
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { computeDestinationPoint } from 'geolib'
import {
  getTrainDateRange,
  getTrainStationAverageDelays,
  getTrainStationTimings,
  groupTrainRides,
  groupTrainRoutes,
} from './trainData'

describe('train data', () => {
  it('builds a one-day Israel-local range and safe GTFS dates', () => {
    const range = getTrainDateRange('2026-07-20')

    expect(range.dateFrom.toISOString()).toBe('2026-07-20T12:00:00.000Z')
    expect(range.dateTo.toISOString()).toBe('2026-07-20T12:00:00.000Z')
    expect(range.timeFrom.toISOString()).toBe('2026-07-19T21:00:00.000Z')
    expect(range.timeTo.toISOString()).toBe('2026-07-20T21:00:00.000Z')
  })

  it('groups route names and deduplicates line refs', () => {
    const route = (lineRef: number, routeLongName: string): GtfsRoutePydanticModel => ({
      id: lineRef,
      date: new Date('2026-07-20'),
      lineRef,
      operatorRef: 2,
      routeLongName,
    })

    expect(
      groupTrainRoutes([route(20, 'B'), route(11, 'A'), route(10, 'A'), route(10, 'A')]),
    ).toEqual([
      { routeLongName: 'A', lineRefs: [10, 11] },
      { routeLongName: 'B', lineRefs: [20] },
    ])
  })

  it('groups actual locations by ride and attaches ordered GTFS stops', () => {
    const locations: SiriVehicleLocationWithRelatedPydanticModel[] = [
      {
        id: 2,
        siriRideId: 7,
        siriRideGtfsRideId: 70,
        siriRideScheduledStartTime: new Date('2026-07-20T08:00:00Z'),
        recordedAtTime: new Date('2026-07-20T08:02:00Z'),
      },
      {
        id: 1,
        siriRideId: 7,
        siriRideGtfsRideId: 70,
        siriRideScheduledStartTime: new Date('2026-07-20T08:00:00Z'),
        recordedAtTime: new Date('2026-07-20T08:01:00Z'),
      },
    ]
    const stops: GtfsRideStopWithRelatedPydanticModel[] = [
      { id: 2, gtfsRideId: 70, stopSequence: 2 },
      { id: 1, gtfsRideId: 70, stopSequence: 1 },
    ]

    const [ride] = groupTrainRides(locations, stops)

    expect(ride.rideId).toBe(7)
    expect(ride.locations.map((location) => location.id)).toEqual([1, 2])
    expect(ride.stops.map((stop) => stop.id)).toEqual([1, 2])
  })

  it('attaches GTFS stops by line and start time when the SIRI ride is not linked', () => {
    const locations: SiriVehicleLocationWithRelatedPydanticModel[] = [
      {
        id: 1,
        siriRideId: 7,
        siriRouteLineRef: 30021,
        siriRideScheduledStartTime: new Date('2026-07-21T02:23:00Z'),
      },
    ]
    const stops: GtfsRideStopWithRelatedPydanticModel[] = [
      {
        id: 2,
        gtfsRideId: 70,
        gtfsRouteLineRef: 30021,
        arrivalTime: new Date('2026-07-21T02:26:00Z'),
        stopSequence: 2,
      },
      {
        id: 1,
        gtfsRideId: 70,
        gtfsRouteLineRef: 30021,
        arrivalTime: new Date('2026-07-21T02:23:00Z'),
        stopSequence: 1,
      },
    ]

    const [ride] = groupTrainRides(locations, stops)

    expect(ride.gtfsRideId).toBeUndefined()
    expect(ride.stops.map((stop) => stop.id)).toEqual([1, 2])
  })

  it('handles serialized API timestamps when matching and sorting rides', () => {
    const serializedDate = (value: string) => value as unknown as Date
    const locations: SiriVehicleLocationWithRelatedPydanticModel[] = [
      {
        id: 2,
        siriRideId: 7,
        siriRouteLineRef: 30021,
        siriRideScheduledStartTime: serializedDate('2026-07-21T02:23:00Z'),
        recordedAtTime: serializedDate('2026-07-21T02:25:00Z'),
      },
      {
        id: 1,
        siriRideId: 7,
        siriRouteLineRef: 30021,
        siriRideScheduledStartTime: serializedDate('2026-07-21T02:23:00Z'),
        recordedAtTime: serializedDate('2026-07-21T02:24:00Z'),
      },
    ]
    const stops: GtfsRideStopWithRelatedPydanticModel[] = [
      {
        id: 1,
        gtfsRideId: 70,
        gtfsRouteLineRef: 30021,
        arrivalTime: serializedDate('2026-07-21T02:23:00Z'),
        stopSequence: 1,
      },
    ]

    const [ride] = groupTrainRides(locations, stops)

    expect(ride.locations.map((location) => location.id)).toEqual([1, 2])
    expect(ride.stops.map((stop) => stop.id)).toEqual([1])
  })

  it('does not attach fallback stops from another line or start time', () => {
    const locations: SiriVehicleLocationWithRelatedPydanticModel[] = [
      {
        id: 1,
        siriRideId: 7,
        siriRouteLineRef: 30021,
        siriRideScheduledStartTime: new Date('2026-07-21T02:23:00Z'),
      },
    ]
    const stops: GtfsRideStopWithRelatedPydanticModel[] = [
      {
        id: 1,
        gtfsRideId: 70,
        gtfsRouteLineRef: 30022,
        arrivalTime: new Date('2026-07-21T02:23:00Z'),
        stopSequence: 1,
      },
      {
        id: 2,
        gtfsRideId: 71,
        gtfsRouteLineRef: 30021,
        arrivalTime: new Date('2026-07-21T02:24:00Z'),
        stopSequence: 1,
      },
    ]

    const [ride] = groupTrainRides(locations, stops)

    expect(ride.stops).toEqual([])
  })

  it('uses a buffered nearest-point range and takes its latest GPS candidate', () => {
    const plannedTime = new Date('2026-07-20T10:00:00Z')
    const stops: GtfsRideStopWithRelatedPydanticModel[] = [
      {
        id: 1,
        stopSequence: 1,
        gtfsStopName: 'Station',
        gtfsStopLat: 32,
        gtfsStopLon: 34,
        arrivalTime: plannedTime,
      },
    ]
    const locations: SiriVehicleLocationWithRelatedPydanticModel[] = [
      {
        id: 1,
        lat: 32.0001,
        lon: 34,
        recordedAtTime: new Date('2026-07-20T10:02:00Z'),
      },
      {
        id: 2,
        lat: 32.001,
        lon: 34,
        recordedAtTime: new Date('2026-07-20T10:04:00Z'),
      },
      {
        id: 3,
        lat: 32.005,
        lon: 34,
        recordedAtTime: new Date('2026-07-20T10:06:00Z'),
      },
      {
        id: 4,
        lat: 33,
        lon: 35,
        recordedAtTime: new Date('2026-07-20T10:10:00Z'),
      },
    ]

    const [station] = getTrainStationTimings(stops, locations)

    expect(station.delayMinutes).toBe(4)
    expect(station.status).toBe('on-time')
  })

  it('ignores nearby GPS candidates far from the scheduled arrival', () => {
    const plannedTime = new Date('2026-07-20T10:00:00Z')
    const stops: GtfsRideStopWithRelatedPydanticModel[] = [
      {
        id: 1,
        gtfsStopLat: 32,
        gtfsStopLon: 34,
        arrivalTime: plannedTime,
      },
    ]
    const locations: SiriVehicleLocationWithRelatedPydanticModel[] = [
      {
        id: 1,
        lat: 32,
        lon: 34,
        recordedAtTime: new Date('2026-07-20T10:04:00Z'),
      },
      {
        id: 2,
        lat: 32,
        lon: 34,
        recordedAtTime: new Date('2026-07-20T10:45:00Z'),
      },
    ]

    const [station] = getTrainStationTimings(stops, locations)

    expect(station.delayMinutes).toBe(4)
  })

  it('accepts a point at 1 km and applies the inclusive delay boundaries', () => {
    const plannedTime = new Date('2026-07-20T10:00:00Z')
    const stop = {
      id: 1,
      gtfsStopLat: 32,
      gtfsStopLon: 34,
      arrivalTime: plannedTime,
    }
    const pointAtOneKilometer = computeDestinationPoint(
      { latitude: stop.gtfsStopLat, longitude: stop.gtfsStopLon },
      // geolib's destination and distance calculations use slightly different
      // earth-radius approximations; 999 destination meters rounds to 1,000 here.
      999,
      90,
    )

    const [early] = getTrainStationTimings(
      [stop],
      [
        {
          lat: pointAtOneKilometer.latitude,
          lon: pointAtOneKilometer.longitude,
          recordedAtTime: new Date('2026-07-20T09:59:00Z'),
        },
      ],
    )
    const [late] = getTrainStationTimings(
      [stop],
      [
        {
          lat: stop.gtfsStopLat,
          lon: stop.gtfsStopLon,
          recordedAtTime: new Date('2026-07-20T10:05:00Z'),
        },
      ],
    )

    expect(early.distanceMeters).toBe(1_000)
    expect(early.status).toBe('on-time')
    expect(late.status).toBe('on-time')
  })

  it('allows an early arrival at the final stop regardless of its GTFS sequence', () => {
    const stops: GtfsRideStopWithRelatedPydanticModel[] = [
      {
        id: 1,
        stopSequence: 0,
        gtfsStopLat: 32,
        gtfsStopLon: 34,
        arrivalTime: new Date('2026-07-20T10:00:00Z'),
      },
      {
        id: 2,
        stopSequence: 10,
        gtfsStopLat: 32,
        gtfsStopLon: 34,
        arrivalTime: new Date('2026-07-20T10:00:00Z'),
      },
    ]
    const locations: SiriVehicleLocationWithRelatedPydanticModel[] = [
      {
        lat: 32,
        lon: 34,
        recordedAtTime: new Date('2026-07-20T09:58:00Z'),
      },
    ]

    const timings = getTrainStationTimings(stops, locations)

    expect(timings.map(({ status }) => status)).toEqual(['out-of-range', 'on-time'])
  })

  it('marks a station without usable GPS data as no-data', () => {
    const stops: GtfsRideStopWithRelatedPydanticModel[] = [
      {
        id: 1,
        stopSequence: 1,
        gtfsStopName: 'Station',
        gtfsStopLat: 32,
        gtfsStopLon: 34,
        arrivalTime: new Date('2026-07-20T10:00:00Z'),
      },
    ]
    const locations: SiriVehicleLocationWithRelatedPydanticModel[] = [
      { id: 1, recordedAtTime: new Date('2026-07-20T10:00:00Z') },
      { id: 2, lat: 33, lon: 35, recordedAtTime: new Date('2026-07-20T10:00:00Z') },
    ]

    expect(getTrainStationTimings(stops, locations)).toEqual([
      {
        id: 1,
        stopSequence: 1,
        name: 'Station',
        plannedTime: new Date('2026-07-20T10:00:00Z'),
        status: 'no-data',
      },
    ])
  })

  it('averages available delays for the same station across rides', () => {
    const ride = (
      rideId: number,
      stationId: number,
      stationName: string,
      stopSequence: number,
      delayMinutes?: number,
    ) => ({
      rideId,
      stops: [
        {
          gtfsStopId: stationId,
          gtfsStopName: stationName,
          stopSequence,
          gtfsStopLat: 32,
          gtfsStopLon: 34,
          arrivalTime: new Date('2026-07-20T10:00:00Z'),
        },
      ],
      locations:
        delayMinutes === undefined
          ? []
          : [
              {
                lat: 32,
                lon: 34,
                recordedAtTime: new Date(
                  new Date('2026-07-20T10:00:00Z').getTime() + delayMinutes * 60_000,
                ),
              },
            ],
    })

    expect(
      getTrainStationAverageDelays([
        ride(1, 20, 'Beta', 2, -1),
        ride(2, 10, 'Alpha', 1, 2),
        ride(3, 10, 'Alpha', 1, 4),
        ride(4, 10, 'Alpha', 1),
      ]),
    ).toEqual([
      { stationKey: '10', name: 'Alpha', averageDelayMinutes: 3 },
      { stationKey: '20', name: 'Beta', averageDelayMinutes: -1 },
    ])
  })
})

import type { GtfsRideStopWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import {
  BAND_HOVER_SLACK,
  bandDeviation,
  departureKey,
  deviationSpans,
  hitTime,
  instantY,
  pairTimelineHits,
  pickBandKey,
  type SiriHit,
  type TimelineBand,
  type TimelineHit,
} from './timelinePairing'
import { POINT_SIZE } from './TimelinePoint'

const DEPARTURE = new Date('2026-08-20T05:00:00Z')
const OTHER_DEPARTURE = new Date('2026-08-20T05:20:00Z')

const planned = (
  arrivalTime: string,
  gtfsRideStartTime = DEPARTURE,
): GtfsRideStopWithRelatedPydanticModel => ({
  id: 1,
  arrivalTime: new Date(arrivalTime),
  gtfsRideStartTime,
})

const actual = (recordedAtTime: string, siriRideScheduledStartTime = DEPARTURE): SiriHit => ({
  id: 2,
  recordedAtTime: new Date(recordedAtTime),
  siriRideScheduledStartTime,
  lat: 32.068272,
  lon: 34.79298,
  latitude: 32.068272,
  longitude: 34.79298,
})

/** What the persisted query cache hands back: the same hit, minus its Date objects. */
const rehydrated = <T>(hit: T): T => JSON.parse(JSON.stringify(hit)) as T

describe('departureKey', () => {
  it('gives a planned and an actual hit of the same ride the same key', () => {
    expect(departureKey(planned('2026-08-20T05:30:00Z'))).toBe(
      departureKey(actual('2026-08-20T05:32:00Z')),
    )
  })

  it('separates rides departing a minute apart', () => {
    expect(departureKey(actual('2026-08-20T05:32:00Z', new Date('2026-08-20T05:01:00Z')))).not.toBe(
      departureKey(actual('2026-08-20T05:32:00Z')),
    )
  })

  it('ignores seconds within a departure minute', () => {
    expect(departureKey(actual('2026-08-20T05:32:00Z', new Date('2026-08-20T05:00:41Z')))).toBe(
      departureKey(planned('2026-08-20T05:30:00Z')),
    )
  })

  it('has no key for a ride with no departure time', () => {
    expect(departureKey(new Date('2026-08-20T05:30:00Z'))).toBeUndefined()
    expect(departureKey({ id: 3, arrivalTime: new Date('2026-08-20T05:30:00Z') })).toBeUndefined()
  })

  // The API client parses these into Dates, but the persisted react-query cache
  // round-trips them through JSON, so a restored hit carries ISO strings under a Date type.
  it('pairs hits restored from the persisted cache, where the dates are strings', () => {
    expect(departureKey(rehydrated(planned('2026-08-20T05:30:00Z')))).toBe(
      departureKey(rehydrated(actual('2026-08-20T05:32:00Z'))),
    )
  })

  it('leaves a hit unpaired rather than keying it on an unparseable departure', () => {
    const corrupt = {
      ...planned('2026-08-20T05:30:00Z'),
      gtfsRideStartTime: 'not a time' as unknown as Date,
    }
    expect(departureKey(corrupt)).toBeUndefined()
  })
})

describe('pairTimelineHits', () => {
  // tops keyed off the hit's own time, so the band maths is readable
  const topOf = (hit: TimelineHit) =>
    ({
      '2026-08-20T05:30:00.000Z': 10,
      '2026-08-20T05:32:00.000Z': 100,
      '2026-08-20T05:40:00.000Z': 450,
    })[hitTime(hit).toISOString()]!

  it('spans a band from the planned dot to the actual one', () => {
    const { gtfsKeys, siriKeys, bands } = pairTimelineHits(
      [planned('2026-08-20T05:30:00Z')],
      [actual('2026-08-20T05:32:00Z')],
      topOf,
    )

    expect(gtfsKeys).toEqual(siriKeys)
    expect(bands).toMatchObject([
      {
        key: gtfsKeys[0],
        top: 10,
        bottom: 100 + POINT_SIZE,
        marks: [10, 100],
        plannedTops: [10],
        actualTops: [100],
      },
    ])
  })

  it('keeps a ride with no actual counterpart hoverable on its own', () => {
    const { bands } = pairTimelineHits(
      [planned('2026-08-20T05:30:00Z'), planned('2026-08-20T05:40:00Z', OTHER_DEPARTURE)],
      [actual('2026-08-20T05:32:00Z')],
      topOf,
    )

    expect(bands).toHaveLength(2)
    const lone = bands.find((band) => band.marks.length === 1)
    expect(lone).toMatchObject({ top: 450, bottom: 450 + POINT_SIZE })
  })

  it('builds the same bands from a cache-restored board as from a freshly fetched one', () => {
    const gtfs = [planned('2026-08-20T05:30:00Z')]
    const siri = [actual('2026-08-20T05:32:00Z')]

    expect(pairTimelineHits(gtfs.map(rehydrated), siri.map(rehydrated), topOf)).toEqual(
      pairTimelineHits(gtfs, siri, topOf),
    )
  })

  it('never pairs hits whose rides have no departure time', () => {
    const { gtfsKeys, siriKeys, bands } = pairTimelineHits(
      [{ id: 1, arrivalTime: new Date('2026-08-20T05:30:00Z') }],
      [{ ...actual('2026-08-20T05:32:00Z'), siriRideScheduledStartTime: undefined }],
      topOf,
    )

    expect(gtfsKeys[0]).not.toBe(siriKeys[0])
    expect(bands).toHaveLength(2)
  })
})

describe('bandDeviation', () => {
  const band = (over: Partial<TimelineBand>): TimelineBand => ({
    key: 'k',
    top: 0,
    bottom: 0,
    marks: [],
    plannedTops: [],
    actualTops: [],
    pairable: true,
    ...over,
  })

  // y grows downwards with time, so a lower actual dot means a later arrival
  it('calls a ride late when its actual dot sits below the planned one', () => {
    expect(bandDeviation(band({ plannedTops: [10], actualTops: [100] }))).toBe('late')
  })

  it('calls a ride early when its actual dot sits above the planned one', () => {
    expect(bandDeviation(band({ plannedTops: [100], actualTops: [10] }))).toBe('early')
  })

  it('calls a ride on time when the two dots coincide', () => {
    expect(bandDeviation(band({ plannedTops: [50], actualTops: [50] }))).toBe('on-time')
  })

  it('names the two half-pairs so each can be marked on the axis it is missing from', () => {
    expect(bandDeviation(band({ plannedTops: [10] }))).toBe('no-show')
    expect(bandDeviation(band({ actualTops: [10] }))).toBe('unscheduled')
  })

  // Line 70א at stop 36090 held four actual records under one departure minute — duplicate
  // siri_rides for one bus. The overall direction reads against the nearest of them.
  it('reads a departure with several actual records against the nearest one', () => {
    expect(bandDeviation(band({ plannedTops: [100], actualTops: [20, 130, 133, 140] }))).toBe(
      'late',
    )
  })

  it('claims nothing about a hit that could never have paired', () => {
    // no departure time, so its lone dot is not evidence that a counterpart is missing
    expect(bandDeviation(band({ plannedTops: [10], pairable: false }))).toBe('unknown')
  })
})

describe('deviationSpans', () => {
  const band = (over: Partial<TimelineBand>): TimelineBand => ({
    key: 'k',
    top: 0,
    bottom: 0,
    marks: [],
    plannedTops: [],
    actualTops: [],
    pairable: true,
    ...over,
  })

  it('measures centre to centre, so the height is the delay itself', () => {
    expect(deviationSpans(band({ plannedTops: [10], actualTops: [100] }))).toEqual([
      { top: instantY(10), bottom: instantY(100), deviation: 'late' },
    ])
  })

  // A double trip runs one departure with two vehicles, each with its own deviation.
  // Measuring only the nearest left every other vehicle of the departure uncoloured.
  it('gives every vehicle of a departure its own span and direction', () => {
    expect(deviationSpans(band({ plannedTops: [100], actualTops: [160, 40] }))).toEqual([
      { top: instantY(40), bottom: instantY(100), deviation: 'early' },
      { top: instantY(100), bottom: instantY(160), deviation: 'late' },
    ])
  })

  it('spans nothing for a punctual ride, and nothing at all without a counterpart', () => {
    expect(deviationSpans(band({ plannedTops: [50], actualTops: [50] }))).toEqual([
      { top: instantY(50), bottom: instantY(50), deviation: 'on-time' },
    ])
    expect(deviationSpans(band({ top: 42, plannedTops: [42], actualTops: [] }))).toEqual([])
  })
})

describe('pickBandKey', () => {
  const band = (key: string, top: number, bottom: number): TimelineBand => ({
    key,
    top,
    bottom,
    marks: [top],
    plannedTops: [top],
    actualTops: [bottom],
    pairable: true,
  })

  it('picks the band the pointer sits in', () => {
    expect(pickBandKey([band('a', 10, 108), band('b', 450, 458)], 50)).toBe('a')
    expect(pickBandKey([band('a', 10, 108), band('b', 450, 458)], 452)).toBe('b')
  })

  it('prefers the narrowest band when a short one nests inside a long one', () => {
    const bands = [band('long', 0, 200), band('short', 90, 110)]
    expect(pickBandKey(bands, 100)).toBe('short')
    expect(pickBandKey(bands, 60)).toBe('long')
  })

  it('reaches a band just outside the pointer, but not a distant one', () => {
    const bands = [band('a', 10, 108)]
    expect(pickBandKey(bands, 108 + BAND_HOVER_SLACK - 1)).toBe('a')
    expect(pickBandKey(bands, 10 - BAND_HOVER_SLACK + 1)).toBe('a')
    expect(pickBandKey(bands, 108 + BAND_HOVER_SLACK + 1)).toBeUndefined()
  })

  it('highlights nothing when the pointer is between two far-apart bands', () => {
    expect(pickBandKey([band('a', 10, 108), band('b', 450, 458)], 200)).toBeUndefined()
  })
})

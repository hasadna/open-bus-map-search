import {
  GtfsRideStopWithRelatedPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import dayjs from 'src/dayjs'
import { Coordinates } from 'src/model/location'
import { POINT_SIZE } from 'src/pages/components/timeline/TimelinePoint'

export type SiriHit = SiriVehicleLocationWithRelatedPydanticModel & Coordinates
export type TimelineHit = GtfsRideStopWithRelatedPydanticModel | SiriHit | Date

/** `top`/`bottom` include the dots themselves, so a lone dot still has a hoverable band. */
export type TimelineBand = {
  key: string
  top: number
  bottom: number
  marks: number[]
  plannedTops: number[]
  actualTops: number[]
  /** False for a hit whose ride has no departure time: it could never have paired, so a
   *  missing counterpart says nothing about the ride. */
  pairable: boolean
}

export type BandDeviation = 'late' | 'early' | 'on-time' | 'no-show' | 'unscheduled' | 'unknown'

/**
 * A departure minute can hold several actual records — genuinely two vehicles on one
 * departure, or one bus filed under duplicate siri_ride ids. Spanning all of them would
 * measure how far apart the *records* are, not how far off the ride ran, so the planned
 * time is read against the actual nearest to it.
 */
export function deviationPair(band: TimelineBand): { planned: number; actual: number } | undefined {
  if (!band.plannedTops.length || !band.actualTops.length) return undefined
  const planned = Math.min(...band.plannedTops)
  const actual = band.actualTops.reduce(
    (closest, top) => (Math.abs(top - planned) < Math.abs(closest - planned) ? top : closest),
    band.actualTops[0],
  )
  return { planned, actual }
}

export function bandDeviation(band: TimelineBand): BandDeviation {
  const pair = deviationPair(band)
  // y grows with time, so a lower actual dot is a later arrival
  if (pair) {
    if (pair.actual > pair.planned) return 'late'
    if (pair.actual < pair.planned) return 'early'
    return 'on-time'
  }
  if (!band.pairable) return 'unknown'
  return band.plannedTops.length ? 'no-show' : 'unscheduled'
}

export const instantY = (dotTop: number) => dotTop + POINT_SIZE / 2

export type DeviationSpan = { top: number; bottom: number; deviation: BandDeviation }

/** The early and late blocks meet at the scheduled instant rather than overlapping. Measured
 *  centre to centre, so a block's height is exactly the delay. */
export function deviationSpans(band: TimelineBand): DeviationSpan[] {
  if (!band.plannedTops.length || !band.actualTops.length) return []
  const planned = Math.min(...band.plannedTops)
  const earliest = Math.min(...band.actualTops)
  const latest = Math.max(...band.actualTops)

  const spans: DeviationSpan[] = []
  if (earliest < planned)
    spans.push({ top: instantY(earliest), bottom: instantY(planned), deviation: 'early' })
  if (latest > planned)
    spans.push({ top: instantY(planned), bottom: instantY(latest), deviation: 'late' })
  if (spans.length === 0)
    spans.push({ top: instantY(planned), bottom: instantY(planned), deviation: 'on-time' })
  return spans
}

export const BAND_HOVER_SLACK = 6

export function hitTime(hit: TimelineHit): Date {
  const time =
    (hit as GtfsRideStopWithRelatedPydanticModel).arrivalTime ??
    (hit as SiriHit).recordedAtTime ??
    (hit as Date)
  // Typed Date, but a string once the hit has been through the persisted query cache.
  return time instanceof Date ? time : new Date(time)
}

/**
 * The only field that actually pairs the two columns: `siri_ride.gtfs_ride_id` is null
 * throughout the DB (verified across routes and dates, back to 2025), and the two
 * `journey_ref` schemes are unrelated formats. Departures are unique to the minute within a
 * route, so exact-minute equality pairs without ambiguity.
 *
 * dayjs, not `.getTime()` — the field is a string after a cache round-trip (see `hitTime`).
 * An unparseable value yields no key at all, so those hits stay unpaired instead of all
 * colliding on one bogus key.
 */
export function departureKey(hit: TimelineHit): string | undefined {
  const departure =
    (hit as GtfsRideStopWithRelatedPydanticModel).gtfsRideStartTime ??
    (hit as SiriHit).siriRideScheduledStartTime
  if (!departure) return undefined

  const departedAt = dayjs(departure).valueOf()
  return Number.isFinite(departedAt) ? String(Math.floor(departedAt / 60_000)) : undefined
}

/**
 * A hit whose ride has no departure time gets a band of its own, keyed per column so it can
 * never pair with anything — an unpairable dot stays hoverable instead of going dead.
 */
export function pairTimelineHits(
  gtfsTimes: GtfsRideStopWithRelatedPydanticModel[],
  siriTimes: SiriHit[],
  topOf: (hit: TimelineHit) => number,
): { gtfsKeys: string[]; siriKeys: string[]; bands: TimelineBand[] } {
  const keysOf = (hits: TimelineHit[], column: string) =>
    hits.map((hit, index) => departureKey(hit) ?? `${column}#${index}`)

  const gtfsKeys = keysOf(gtfsTimes, 'gtfs')
  const siriKeys = keysOf(siriTimes, 'siri')

  type Collected = { plannedTops: number[]; actualTops: number[]; pairable: boolean }
  const byKey = new Map<string, Collected>()
  const collect = (hits: TimelineHit[], keys: string[], column: 'plannedTops' | 'actualTops') =>
    hits.forEach((hit, index) => {
      const key = keys[index]
      const entry = byKey.get(key) ?? { plannedTops: [], actualTops: [], pairable: false }
      entry[column].push(topOf(hit))
      entry.pairable = departureKey(hit) !== undefined
      byKey.set(key, entry)
    })
  collect(gtfsTimes, gtfsKeys, 'plannedTops')
  collect(siriTimes, siriKeys, 'actualTops')

  // A ride that ran exactly on time puts both dots on the same line — one mark, not two.
  const bands = Array.from(byKey, ([key, { plannedTops, actualTops, pairable }]) => {
    const marks = Array.from(new Set([...plannedTops, ...actualTops]))
    return {
      key,
      top: Math.min(...marks),
      bottom: Math.max(...marks) + POINT_SIZE,
      marks,
      plannedTops,
      actualTops,
      pairable,
    }
  })

  return { gtfsKeys, siriKeys, bands }
}

/** Narrowest match wins, so a short band nested inside a long one is still reachable. */
export function pickBandKey(bands: TimelineBand[], y: number): string | undefined {
  let best: TimelineBand | undefined
  let bestSpan = Infinity
  for (const band of bands) {
    if (y < band.top || y > band.bottom) continue
    const span = band.bottom - band.top
    if (span < bestSpan) {
      best = band
      bestSpan = span
    }
  }
  if (best) return best.key

  let bestDistance = BAND_HOVER_SLACK
  for (const band of bands) {
    const distance = y < band.top ? band.top - y : y - band.bottom
    if (distance < bestDistance) {
      best = band
      bestDistance = distance
    }
  }
  return best?.key
}

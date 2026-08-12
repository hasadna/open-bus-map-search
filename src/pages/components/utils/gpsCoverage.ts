import { getDistance } from 'geolib'
import { Point } from 'src/pages/components/map-related/map-types'

/**
 * A gap up to this multiple of the ride's median interval is normal jitter (`ok`).
 * Between this and {@link GAP_FACTOR} the coverage is `sparse`; above it, a `gap`.
 */
export const SPARSE_FACTOR = 2
export const GAP_FACTOR = 4

export interface PingGap {
  /** recordedAtTime of the earlier ping, epoch ms. */
  startMs: number
  /** recordedAtTime of the later ping, epoch ms. */
  endMs: number
  /** Elapsed time between the two consecutive pings (endMs - startMs). */
  gapMs: number
  /** [lat, lon] of the earlier ping — the last known position before the gap. */
  startLoc: [number, number]
  /** [lat, lon] of the later ping — the first position after the gap. */
  endLoc: [number, number]
}

export type Density = 'gap' | 'sparse' | 'ok'

/**
 * Sorted, valid (positive-timestamp) pings for a ride, collapsing pings that share a
 * `recordedAtTime`. Re-ingested copies of one observation are already gone by here — upstream
 * dedups on `locationFixKey` — but rows sharing a timestamp while *disagreeing* on position
 * survive that key, because nothing in the data says which of the two positions is the real
 * one. Gaps are measured in time, so they are collapsed here regardless (a zero-length gap is
 * meaningless) and the first row wins, arbitrarily.
 *
 * That arbitrary pick reaches the UI: the surviving row becomes a gap's `startLoc`/`endLoc`,
 * which feed the strip's distance tooltip and its fly-to-ping target. Conflicting pairs have
 * been observed kilometres apart, so for such a gap the distance shown can be measured from
 * the wrong end. Fixing it needs a rule for which row wins — one the SIRI data doesn't give us.
 */
function sortedTimedPings(positions: Point[]): { t: number; loc: [number, number] }[] {
  const sorted = positions
    .filter((p) => (p.recordedAtTime ?? 0) > 0)
    .map((p) => ({ t: p.recordedAtTime as number, loc: p.loc }))
    .sort((a, b) => a.t - b.t)
  // Equal timestamps are now adjacent — drop every ping whose time matches its predecessor.
  return sorted.filter((p, i) => i === 0 || p.t !== sorted[i - 1].t)
}

/**
 * The elapsed time between each pair of consecutive pings across the ride. Each gap also
 * carries its two bounding ping locations (for the strip's distance readout and map focus).
 * Returns [] for fewer than two valid pings.
 */
export function pingGaps(positions: Point[]): PingGap[] {
  const pings = sortedTimedPings(positions)
  const gaps: PingGap[] = []
  for (let i = 1; i < pings.length; i++) {
    gaps.push({
      startMs: pings[i - 1].t,
      endMs: pings[i].t,
      gapMs: pings[i].t - pings[i - 1].t,
      startLoc: pings[i - 1].loc,
      endLoc: pings[i].loc,
    })
  }
  return gaps
}

/**
 * Number of valid, distinct-time pings for a ride — i.e. how many points remain after
 * dropping zero-timestamp rows and collapsing duplicate `recorded_at_time`s. A strip needs
 * at least two (one gap); below that the caller can tell "reported nothing" (0) from
 * "reported once" (1) to show a specific notice instead of a blank strip.
 */
export function distinctPingCount(positions: Point[]): number {
  return sortedTimedPings(positions).length
}

/**
 * Median gap (ms) between consecutive pings — the ride's natural reporting cadence,
 * used as the baseline every gap is judged against. Returns 0 with fewer than two pings.
 */
export function medianPingInterval(positions: Point[]): number {
  const gaps = pingGaps(positions).map((g) => g.gapMs)
  if (gaps.length === 0) return 0
  gaps.sort((a, b) => a - b)
  const mid = Math.floor(gaps.length / 2)
  return gaps.length % 2 === 0 ? (gaps[mid - 1] + gaps[mid]) / 2 : gaps[mid]
}

/** Great-circle distance between two [lat, lon] points, in meters (via geolib). */
export function distanceMeters(a: [number, number], b: [number, number]): number {
  return getDistance({ latitude: a[0], longitude: a[1] }, { latitude: b[0], longitude: b[1] })
}

/**
 * Ground speed (km/h) at each ping, from the distance the ride actually covered to its next
 * fix. Indexed like `positions`; `undefined` where the timing can't support a figure.
 *
 * SIRI's own `velocity` is a spot reading taken at the instant of the fix, which is a poor
 * answer to the question a map asks — how fast was the bus *through here*. Sampled against the
 * live API, 88% of the fixes reporting velocity 0 had covered more than 5 km/h worth of ground
 * by the next fix a minute later; reported and derived speed correlate only r≈0.76.
 *
 * A ping takes the speed of the segment *leaving* it, so the figure pairs with the bearing,
 * which also points forward; the last ping takes the segment arriving at it. Segments spanning
 * a coverage dropout ({@link GAP_FACTOR}× the ride's cadence) are left undefined: averaging
 * across an hour of silence would report a crawl for a bus that drove the whole way.
 */
export function pingSpeedsKmh(positions: Point[]): (number | undefined)[] {
  const speeds = new Array<number | undefined>(positions.length).fill(undefined)
  const timed = positions
    .map((p, index) => ({ index, t: p.recordedAtTime ?? 0, loc: p.loc }))
    .filter((p) => p.t > 0)
    .sort((a, b) => a.t - b.t)
  const dropoutMs = medianPingInterval(positions) * GAP_FACTOR

  for (let i = 1; i < timed.length; i++) {
    const gapMs = timed[i].t - timed[i - 1].t
    // gapMs 0 is a frozen clock (two fixes, one timestamp) — there is no elapsed time to divide by.
    if (gapMs <= 0 || (dropoutMs > 0 && gapMs > dropoutMs)) continue
    const kmh = (distanceMeters(timed[i - 1].loc, timed[i].loc) / (gapMs / 1000)) * 3.6
    speeds[timed[i - 1].index] = kmh
    if (i === timed.length - 1) speeds[timed[i].index] = kmh
  }
  return speeds
}

/**
 * Classify a single inter-ping gap relative to the ride's median cadence:
 *  - `ok`     — within {@link SPARSE_FACTOR}× the median (normal jitter)
 *  - `sparse` — between {@link SPARSE_FACTOR}× and {@link GAP_FACTOR}× (degraded)
 *  - `gap`    — beyond {@link GAP_FACTOR}× (the bus effectively stopped reporting)
 *
 * With no usable baseline (median <= 0, e.g. a single ping) everything is `ok`.
 */
export function classifyGap(gapMs: number, medianMs: number): Density {
  if (medianMs <= 0) return 'ok'
  if (gapMs > medianMs * GAP_FACTOR) return 'gap'
  if (gapMs > medianMs * SPARSE_FACTOR) return 'sparse'
  return 'ok'
}

/**
 * Continuous severity of a gap on a 0–1 scale, for coloring the strip with a smooth
 * gradient instead of the three discrete {@link classifyGap} bands: 0 when the gap is at
 * (or below) the median cadence, ramping linearly to 1 once it reaches the
 * {@link GAP_FACTOR}× dropout threshold. With no usable baseline (median <= 0) it is 0.
 */
export function gapSeverity(gapMs: number, medianMs: number): number {
  if (medianMs <= 0) return 0
  const ratio = gapMs / medianMs
  return Math.min(1, Math.max(0, (ratio - 1) / (GAP_FACTOR - 1)))
}

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
 * `recordedAtTime`. The SIRI pipeline re-ingests the same observation across snapshots, so a
 * ride routinely carries rows with identical `recordedAtTime` (and lat/lon) but distinct ids
 * that survive the upstream `uniqBy(id)`. Same time means same position, so keeping the first
 * row per timestamp is lossless and avoids meaningless zero-length gaps.
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

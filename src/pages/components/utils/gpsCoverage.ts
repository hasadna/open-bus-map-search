import { Point } from 'src/pages/components/map-related/map-types'

/**
 * A gap up to this multiple of the ride's median interval is normal jitter (`ok`).
 * Between this and {@link GAP_FACTOR} the coverage is `sparse`; above it, a `gap`.
 * Tuned against the median so it self-calibrates to each operator's cadence.
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
 * Sorted, valid (positive-timestamp) pings for a ride, keeping each ping's location and
 * collapsing pings that share a `recordedAtTime`. The SIRI pipeline re-ingests the same
 * onboard observation across snapshots, so a ride routinely carries several rows with an
 * identical `recordedAtTime` (and identical lat/lon) but distinct DB ids — which survive
 * the `uniqBy(id)` dedup upstream. Left in, each duplicate becomes a meaningless
 * zero-length gap and two columns share a `startMs` (a duplicate React key). Since same
 * time means same position in the data, keeping the first row per timestamp is lossless.
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
 * The elapsed time between each pair of consecutive pings across the ride. This is the
 * raw signal the coverage strip renders: a healthy ride is a run of short, even gaps;
 * a bus that stopped reporting (technical fault) or crossed a poor-reception area shows
 * up as one long gap. Each gap also carries the two bounding ping locations so the strip
 * can show how far the bus moved while dark and focus the map on the last-seen position.
 * Returns [] for fewer than two valid pings (nothing to span).
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

/** Great-circle (haversine) distance between two [lat, lon] points, in meters. */
export function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6_371_000 // Earth radius, m
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
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

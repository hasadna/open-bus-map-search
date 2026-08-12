import { Point } from 'src/pages/components/map-related/map-types'
import {
  classifyGap,
  distanceMeters,
  gapSeverity,
  medianPingInterval,
  pingGaps,
} from './gpsCoverage'

/**
 * Unit tests for the per-ride GPS coverage measure used by the SingleLineMap strip.
 * The strip is built from the elapsed time *between consecutive pings* (not fixed
 * clock buckets), so a bus that stops reporting surfaces as one long gap. The gap
 * extraction and the median-relative classification are locked here.
 */

// Minimal Point factory — only recordedAtTime matters for coverage.
const ping = (recordedAtTime: number): Point => ({
  loc: [0, 0],
  color: 0,
  recordedAtTime,
})

const MIN = 60_000
const base = 1_000_000

describe('pingGaps', () => {
  it('returns no gaps for fewer than two pings', () => {
    expect(pingGaps([])).toEqual([])
    expect(pingGaps([ping(base)])).toEqual([])
  })

  it('ignores pings without a valid timestamp', () => {
    expect(pingGaps([ping(base), { loc: [0, 0], color: 0 }])).toEqual([])
  })

  it('produces one gap per consecutive pair, spanning the whole ride contiguously', () => {
    const gaps = pingGaps([ping(base), ping(base + 10_000), ping(base + 30_000)])
    expect(gaps).toEqual([
      { startMs: base, endMs: base + 10_000, gapMs: 10_000, startLoc: [0, 0], endLoc: [0, 0] },
      {
        startMs: base + 10_000,
        endMs: base + 30_000,
        gapMs: 20_000,
        startLoc: [0, 0],
        endLoc: [0, 0],
      },
    ])
    // contiguous: each gap starts where the previous ended
    for (let i = 1; i < gaps.length; i++) {
      expect(gaps[i].startMs).toBe(gaps[i - 1].endMs)
    }
  })

  it('sorts out-of-order pings before computing gaps', () => {
    const gaps = pingGaps([ping(base + 30_000), ping(base), ping(base + 10_000)])
    expect(gaps.map((g) => g.gapMs)).toEqual([10_000, 20_000])
  })

  it('surfaces a long dropout as a single wide gap', () => {
    const gaps = pingGaps([ping(base), ping(base + 15_000), ping(base + 15_000 + 5 * MIN)])
    expect(gaps.map((g) => g.gapMs)).toEqual([15_000, 5 * MIN])
  })

  it('collapses pings that share a recordedAtTime (SIRI re-ingestion duplicates)', () => {
    // base appears twice (same instant, same place) — the duplicate must not create a
    // zero-length gap or a second gap starting at the same startMs.
    const gaps = pingGaps([ping(base), ping(base), ping(base + 10_000)])
    expect(gaps).toEqual([
      { startMs: base, endMs: base + 10_000, gapMs: 10_000, startLoc: [0, 0], endLoc: [0, 0] },
    ])
  })

  it('keeps every gap startMs unique even with duplicate timestamps', () => {
    const gaps = pingGaps([ping(base), ping(base), ping(base + 10_000), ping(base + 10_000)])
    const starts = gaps.map((g) => g.startMs)
    expect(new Set(starts).size).toBe(starts.length)
  })

  it('carries each bounding ping location onto the gap', () => {
    const a: Point = { loc: [32.1, 34.8], color: 0, recordedAtTime: base }
    const b: Point = { loc: [32.2, 34.9], color: 0, recordedAtTime: base + 10_000 }
    const [gap] = pingGaps([a, b])
    expect(gap.startLoc).toEqual([32.1, 34.8])
    expect(gap.endLoc).toEqual([32.2, 34.9])
  })
})

describe('distanceMeters', () => {
  // Thin [lat, lon]-tuple adapter over geolib.getDistance; these pin the tuple order, not geolib.
  it('is 0 for identical points', () => {
    expect(distanceMeters([32, 34], [32, 34])).toBe(0)
  })

  it('measures ~111 km per degree of latitude', () => {
    const d = distanceMeters([0, 0], [1, 0])
    expect(d).toBeGreaterThan(111_000)
    expect(d).toBeLessThan(111_400)
  })

  it('reads the tuple as [lat, lon] (not [lon, lat])', () => {
    // At latitude 32°, a degree of longitude is much shorter than a degree of latitude;
    // a swapped adapter would make these equal.
    const oneLat = distanceMeters([32, 34], [33, 34])
    const oneLon = distanceMeters([32, 34], [32, 35])
    expect(oneLon).toBeLessThan(oneLat)
  })
})

describe('medianPingInterval', () => {
  it('is 0 with fewer than two pings', () => {
    expect(medianPingInterval([])).toBe(0)
    expect(medianPingInterval([ping(base)])).toBe(0)
  })

  it('computes the median gap between consecutive pings', () => {
    // gaps: 10s, 10s, 30s -> median 10s
    expect(
      medianPingInterval([
        ping(base),
        ping(base + 10_000),
        ping(base + 20_000),
        ping(base + 50_000),
      ]),
    ).toBe(10_000)
  })

  it('averages the two middle gaps for an even count', () => {
    // gaps: 10s, 20s -> median (10+20)/2 = 15s
    expect(medianPingInterval([ping(base), ping(base + 10_000), ping(base + 30_000)])).toBe(15_000)
  })
})

describe('classifyGap', () => {
  // 15s cadence; bands break at the sparse threshold (2× = 30s) and dropout (4× = 60s).
  const median = 15_000

  it('treats everything as ok when there is no baseline', () => {
    expect(classifyGap(10 * MIN, 0)).toBe('ok')
  })

  it('flags a near-cadence gap as ok up to the sparse threshold', () => {
    expect(classifyGap(median, median)).toBe('ok')
    expect(classifyGap(30_000, median)).toBe('ok') // exactly 2×
  })

  it('flags a moderately stretched gap as sparse', () => {
    expect(classifyGap(30_001, median)).toBe('sparse') // just past 2×
    expect(classifyGap(60_000, median)).toBe('sparse') // exactly 4×
  })

  it('flags a long gap as a dropout', () => {
    expect(classifyGap(60_001, median)).toBe('gap') // just past 4×
    expect(classifyGap(5 * MIN, median)).toBe('gap')
  })
})

describe('gapSeverity', () => {
  // 15s cadence; severity ramps 0 at 1× to 1 at the 4× dropout threshold (60s).
  const median = 15_000

  it('is 0 when there is no baseline', () => {
    expect(gapSeverity(10 * MIN, 0)).toBe(0)
  })

  it('is 0 at or below the median cadence', () => {
    expect(gapSeverity(median, median)).toBe(0)
    expect(gapSeverity(median / 2, median)).toBe(0)
  })

  it('reaches 1 at (and clamps above) the dropout threshold', () => {
    expect(gapSeverity(60_000, median)).toBe(1) // exactly 4×
    expect(gapSeverity(10 * MIN, median)).toBe(1) // far beyond
  })

  it('ramps linearly between the median and the dropout threshold', () => {
    expect(gapSeverity(37_500, median)).toBeCloseTo(0.5) // ratio 2.5, halfway from 1× to 4×
  })
})

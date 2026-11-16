import { belongsToTile, cellBounds, ISRAEL_BOUNDS, tilesCovering } from './velocityTiles'

describe('tilesCovering', () => {
  it('lays tiles on the rounding grid, 64 cells a side', () => {
    // precision 8: cells of 1/256°, tiles of 1/4°
    const tiles = tilesCovering({ minLon: 34.6, maxLon: 34.9, minLat: 31.9, maxLat: 32.1 }, 8)
    expect(tiles).toEqual([
      { minLon: 34.5, maxLon: 34.75, minLat: 31.75, maxLat: 32 },
      { minLon: 34.5, maxLon: 34.75, minLat: 32, maxLat: 32.25 },
      { minLon: 34.75, maxLon: 35, minLat: 31.75, maxLat: 32 },
      { minLon: 34.75, maxLon: 35, minLat: 32, maxLat: 32.25 },
    ])
  })

  it('asks for nothing outside Israel', () => {
    expect(tilesCovering({ minLon: 10, maxLon: 20, minLat: 10, maxLat: 20 }, 8)).toEqual([])
    expect(tilesCovering({ minLon: -180, maxLon: 180, minLat: -85, maxLat: 85 }, 0)).toEqual([
      { minLon: 0, maxLon: 64, minLat: 0, maxLat: 64 },
    ])
  })

  it('stops shrinking tiles where the API stops refining', () => {
    const [tile] = tilesCovering({ minLon: 34.78, maxLon: 34.79, minLat: 32.08, maxLat: 32.09 }, 14)
    expect(tile.maxLon - tile.minLon).toBe(1 / 16)
  })

  it('covers all of Israel from far out', () => {
    const tiles = tilesCovering(ISRAEL_BOUNDS, 4)
    expect(Math.min(...tiles.map((t) => t.minLon))).toBeLessThanOrEqual(ISRAEL_BOUNDS.minLon)
    expect(Math.max(...tiles.map((t) => t.maxLat))).toBeGreaterThanOrEqual(ISRAEL_BOUNDS.maxLat)
  })
})

describe('cellBounds', () => {
  it('spans the cell below and west of its label, where the rounding put its readings', () => {
    expect(cellBounds({ roundedLat: 32, roundedLon: 34.75 }, 8)).toEqual([
      [32 - 1 / 256, 34.75 - 1 / 256],
      [32, 34.75],
    ])
  })
})

describe('belongsToTile', () => {
  const tile = { minLon: 34.75, maxLon: 35, minLat: 31.75, maxLat: 32 }

  // Seen on stride-lite for 2026-11-01: this tile answered (34.75, 31.87890625) with 1 sample,
  // the tile to its west with 480, and the single query for both with 480.
  it('leaves a cell on the lower edge to the tile below', () => {
    expect(belongsToTile({ roundedLon: 34.75, roundedLat: 31.87890625 }, tile)).toBe(false)
    expect(belongsToTile({ roundedLon: 34.8, roundedLat: 31.75 }, tile)).toBe(false)
  })

  it('keeps the cells on the upper edge, which end there', () => {
    expect(belongsToTile({ roundedLon: 35, roundedLat: 32 }, tile)).toBe(true)
  })
})

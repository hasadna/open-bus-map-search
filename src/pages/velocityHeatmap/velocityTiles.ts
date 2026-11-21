import type { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'

export interface VelocityAggregationBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

export const ISRAEL_BOUNDS: VelocityAggregationBounds = {
  minLat: 29.5,
  maxLat: 33.33,
  minLon: 34.25,
  maxLon: 35.7,
}

/** The API answers 422 outside this range. */
const MAX_ROUNDING_PRECISION = 10

export const roundingPrecision = (zoom: number) =>
  Math.min(Math.max(zoom, 0), MAX_ROUNDING_PRECISION)

/** About four tiles fill a screen at any zoom, since the precision follows the zoom. */
const CELLS_PER_TILE_SIDE = 64

const cellSize = (precision: number) => 1 / 2 ** precision

/**
 * The tiles that cover `view` within Israel. Their edges lie on the rounding grid, so every
 * cell falls inside exactly one tile and the tiles together answer what one query would.
 */
export function tilesCovering(
  view: VelocityAggregationBounds,
  precision: number,
): VelocityAggregationBounds[] {
  const size = CELLS_PER_TILE_SIDE * cellSize(roundingPrecision(precision))
  const minLon = Math.max(view.minLon, ISRAEL_BOUNDS.minLon)
  const maxLon = Math.min(view.maxLon, ISRAEL_BOUNDS.maxLon)
  const minLat = Math.max(view.minLat, ISRAEL_BOUNDS.minLat)
  const maxLat = Math.min(view.maxLat, ISRAEL_BOUNDS.maxLat)
  const tiles: VelocityAggregationBounds[] = []
  for (let lon = Math.floor(minLon / size) * size; lon < maxLon; lon += size) {
    for (let lat = Math.floor(minLat / size) * size; lat < maxLat; lat += size) {
      tiles.push({ minLon: lon, maxLon: lon + size, minLat: lat, maxLat: lat + size })
    }
  }
  return tiles
}

/**
 * A cell spans the cell size below its label, not around it: the API rounds with
 * `(x * 2^p + 0.5)::INT / 2^p`.
 */
export function cellBounds(
  point: Pick<SiriVelocityAggregationPydanticModel, 'roundedLat' | 'roundedLon'>,
  precision: number,
): [[number, number], [number, number]] {
  const size = cellSize(roundingPrecision(precision))
  return [
    [point.roundedLat - size, point.roundedLon - size],
    [point.roundedLat, point.roundedLon],
  ]
}

/**
 * The API's bounds are inclusive on both ends, so a reading exactly on a tile's lower edge
 * also reaches that tile, as a cell labelled with the edge. The cell lies in the tile below.
 */
export const belongsToTile = (
  point: Pick<SiriVelocityAggregationPydanticModel, 'roundedLat' | 'roundedLon'>,
  tile: VelocityAggregationBounds,
) => point.roundedLon !== tile.minLon && point.roundedLat !== tile.minLat

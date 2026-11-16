import { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import { useQueries } from '@tanstack/react-query'
import { SIRI_API } from 'src/api/apiConfig'
import { isStrideLiteSelected } from 'src/api/strideLite'
import dayjs from 'src/dayjs'
import { belongsToTile, roundingPrecision, type VelocityAggregationBounds } from './velocityTiles'

const cacheDomain = 'https://docbuvbfdq5r6.cloudfront.net/'

const NO_DATA_MESSAGE =
  'No data points with more than 4 samples found in the specified area. Try expanding the area.'

type TileResult = {
  data?: SiriVelocityAggregationPydanticModel[]
  isLoading: boolean
  error: Error | null
}

/**
 * One answer from the tiles: loading only until something can be drawn, so panning onto a new
 * tile keeps the map visible, and "no data" only once every tile came back empty.
 */
export function combineTiles(results: TileResult[]) {
  const data = results.flatMap((r) => r.data ?? [])
  const pending = results.some((r) => r.isLoading)
  const failed = results.find((r) => r.error)?.error ?? null
  const empty = results.length > 0 && !pending && !failed && data.length === 0
  return {
    data,
    loading: pending && data.length === 0,
    error: failed ?? (empty ? new Error(NO_DATA_MESSAGE) : null),
  }
}

export function useVelocityAggregationData(
  tiles: VelocityAggregationBounds[],
  date: dayjs.Dayjs,
  zoom: number,
) {
  date = date.startOf('day').add(12, 'hour') // use midday to avoid timezone issues
  zoom = roundingPrecision(zoom)
  const result = useQueries({
    queries: tiles.map((tile) => ({
      queryFn: () => queryFn(tile, date, zoom),
      queryKey: [
        'velocity_aggregation',
        tile.minLon,
        tile.maxLon,
        tile.minLat,
        tile.maxLat,
        zoom,
        date.toString(),
        'v3',
      ],
    })),
    combine: combineTiles,
  })

  return { ...result, currZoom: zoom }
}

function snakeToCamel(o: SiriVelocityAggregationPydanticModel) {
  return Object.fromEntries(
    Object.entries(o).map(([k, v]) => {
      const newKey = k.replace(/(_\w)/g, (m) => m[1].toUpperCase())
      return [newKey, v]
    }),
  )
}

async function loadFromCache(bounds: VelocityAggregationBounds, date: dayjs.Dayjs, zoom: number) {
  const dataFromCache = await fetch(
    `${cacheDomain}siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=${encodeURIComponent(
      date.toISOString(),
    )}&lon_min=${bounds.minLon}&lon_max=${bounds.maxLon}&lat_min=${bounds.minLat}&lat_max=${bounds.maxLat}&rounding_precision=${zoom}`,
  ).then(async (res) => {
    if (!res.ok) {
      throw new Error('No cached data found')
    }
    const rawResult = await res.json()
    return rawResult.map(snakeToCamel) as SiriVelocityAggregationPydanticModel[]
  })

  return dataFromCache
}

// Past dates come from the pre-aggregated CDN cache, recent dates from the live API;
// both return the same shape (loadFromCache camel-cases the raw JSON), so the caller
// filters and validates once regardless of source.
export async function fetchAggregation(
  bounds: VelocityAggregationBounds,
  date: dayjs.Dayjs,
  zoom: number,
): Promise<SiriVelocityAggregationPydanticModel[]> {
  zoom = roundingPrecision(zoom)
  // The cache holds production's answers, so the experimental API must not be served from it
  if (!isStrideLiteSelected() && date.isBefore(dayjs().subtract(1, 'day'))) {
    try {
      return await loadFromCache(bounds, date, zoom)
    } catch (e) {
      console.warn('Failed to load cached velocity aggregation data', e)
    }
  }
  return SIRI_API.velocityAggregationSiriVelocityAggregationSiriVelocityAggregationGet({
    recordedFrom: date.toDate(),
    lonMin: bounds.minLon,
    lonMax: bounds.maxLon,
    latMin: bounds.minLat,
    latMax: bounds.maxLat,
    roundingPrecision: zoom,
  })
}

export async function queryFn(bounds: VelocityAggregationBounds, date: dayjs.Dayjs, zoom: number) {
  return (await fetchAggregation(bounds, date, zoom)).filter(
    (p) => p.totalSampleCount > 4 && belongsToTile(p, bounds),
  )
}

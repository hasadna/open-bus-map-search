import { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import { SIRI_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'

export interface VelocityAggregationBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

const cacheDomain = 'https://docbuvbfdq5r6.cloudfront.net/'

export function useVelocityAggregationData(
  bounds: VelocityAggregationBounds,
  date: dayjs.Dayjs,
  zoom: number,
) {
  date = date.startOf('day').add(12, 'hour') // use midday to avoid timezone issues
  const { data, isLoading, error } = useQuery({
    queryFn: queryFn.bind(null, bounds, date, zoom),
    queryKey: [
      'velocity_aggregation',
      bounds.minLon,
      bounds.maxLon,
      bounds.minLat,
      bounds.maxLat,
      zoom,
      date.toString(),
      'v2',
    ],
  })

  return { data, loading: isLoading, error, currZoom: zoom }
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
  // only try cached data if date is in the past
  if (date.isBefore(dayjs().subtract(1, 'day'))) {
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
  const data = (await fetchAggregation(bounds, date, zoom)).filter((p) => p.totalSampleCount > 4)

  if (data.length === 0) {
    throw new Error(
      'No data points with more than 4 samples found in the specified area. Try expanding the area.',
    )
  }

  return data
}

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
  timestamp: dayjs.Dayjs,
  zoom: number,
) {
  const { data, isLoading, error } = useQuery({
    queryFn: queryFn.bind(null, bounds, timestamp, zoom),
    queryKey: [
      'velocity_aggregation',
      bounds.minLon,
      bounds.maxLon,
      bounds.minLat,
      bounds.maxLat,
      zoom,
      timestamp.toString(),
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

async function loadFromCache(
  bounds: VelocityAggregationBounds,
  timestamp: dayjs.Dayjs,
  zoom: number,
) {
  const dataFromCache = await fetch(
    `${cacheDomain}siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=${encodeURIComponent(
      timestamp.toISOString(),
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

async function queryFn(bounds: VelocityAggregationBounds, timestamp: dayjs.Dayjs, zoom: number) {
  // only try cached data if date is in the past
  if (timestamp.isBefore(dayjs('yesterday'))) {
    try {
      const cachedData = await loadFromCache(bounds, timestamp, zoom)
      if (cachedData) {
        return cachedData
      }
    } catch (e) {
      console.warn('Failed to load cached velocity aggregation data', e)
    }
  }
  const data = await SIRI_API.velocityAggregationSiriVelocityAggregationSiriVelocityAggregationGet({
    recordedFrom: timestamp.toDate(),
    lonMin: bounds.minLon,
    lonMax: bounds.maxLon,
    latMin: bounds.minLat,
    latMax: bounds.maxLat,
    roundingPrecision: zoom,
  }).then((data) => data.filter((p) => p.totalSampleCount > 4))

  if (data.length === 0) {
    throw new Error(
      'No data points with more than 4 samples found in the specified area. Try expanding the area.',
    )
  }

  return data
}

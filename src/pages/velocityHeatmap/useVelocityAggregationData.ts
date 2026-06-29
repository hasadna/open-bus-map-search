import { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import { SIRI_API } from 'src/api/apiConfig'
import { parseIsraelDate, shiftIsraelDate, todayIsraelDate } from 'src/dayjs'

export interface VelocityAggregationBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

const cacheDomain = 'https://docbuvbfdq5r6.cloudfront.net/'

export function useVelocityAggregationData(
  bounds: VelocityAggregationBounds,
  date: string,
  zoom: number,
) {
  const { data, isLoading, error } = useQuery({
    queryFn: queryFn.bind(null, bounds, date, zoom),
    queryKey: [
      'velocity_aggregation',
      bounds.minLon,
      bounds.maxLon,
      bounds.minLat,
      bounds.maxLat,
      zoom,
      date,
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

async function loadFromCache(bounds: VelocityAggregationBounds, date: string, zoom: number) {
  // Materialize the civil day to an instant only here, at the fetch border. The midday
  // anchor (parseIsraelDate) keeps the day on the correct side of the UTC boundary.
  const recordedFrom = parseIsraelDate(date).toISOString()
  const dataFromCache = await fetch(
    `${cacheDomain}siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=${encodeURIComponent(
      recordedFrom,
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

async function queryFn(bounds: VelocityAggregationBounds, date: string, zoom: number) {
  // Only hit the precomputed cache for days older than yesterday — more recent days may
  // not be aggregated yet. Lexicographic compare works on the "YYYY-MM-DD" civil-day form.
  if (date < shiftIsraelDate(todayIsraelDate(), -1)) {
    try {
      const cachedData = await loadFromCache(bounds, date, zoom)
      if (cachedData) {
        return cachedData
      }
    } catch (e) {
      console.warn('Failed to load cached velocity aggregation data', e)
    }
  }
  const data = await SIRI_API.velocityAggregationSiriVelocityAggregationSiriVelocityAggregationGet({
    recordedFrom: parseIsraelDate(date).toDate(),
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

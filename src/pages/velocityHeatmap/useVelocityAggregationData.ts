import { useQuery } from '@tanstack/react-query'
import { SIRI_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'

export interface VelocityAggregationBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

export function useVelocityAggregationData(
  bounds: VelocityAggregationBounds,
  timestamp: dayjs.Dayjs,
  zoom: number,
) {
  const { data, isLoading, error } = useQuery({
    queryFn: async () => {
      const data =
        await SIRI_API.velocityAggregationSiriVelocityAggregationSiriVelocityAggregationGet({
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
    },
    queryKey: [
      'velocity_aggregation',
      bounds.minLon,
      bounds.maxLon,
      bounds.minLat,
      bounds.maxLat,
      zoom,
      timestamp.toString(),
    ],
  })

  return { data, loading: isLoading, error, currZoom: zoom }
}

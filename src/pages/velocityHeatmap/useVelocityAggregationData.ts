import { useEffect, useState } from 'react'
import dayjs from 'src/dayjs'

export interface VelocityAggregation {
  rounded_lon: number
  rounded_lat: number
  total_sample_count: number
  average_rolling_avg: number
  stddev_rolling_avg: number
}

export interface VelocityAggregationBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

export function useVelocityAggregationData(bounds: VelocityAggregationBounds, zoom: number) {
  const [data, setData] = useState<VelocityAggregation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currZoom, setCurrZoom] = useState(zoom)

  useEffect(() => {
    setLoading(true)
    const apiUrl = `https://open-bus-stride-api.hasadna.org.il/siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=2025-01-01T00%3A00%3A00&lon_min=${bounds.minLon}&lon_max=${bounds.maxLon}&lat_min=${bounds.minLat}&lat_max=${bounds.maxLat}&rounding_precision=${zoom}`
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data')
        return res.json()
      })
      .then((json: unknown) => {
        if (Array.isArray(json)) {
          const valid = json.filter(
            (item) =>
              item.total_sample_count > 4 &&
              typeof item.rounded_lon === 'number' &&
              typeof item.rounded_lat === 'number' &&
              typeof item.total_sample_count === 'number' &&
              typeof item.average_rolling_avg === 'number' &&
              typeof item.stddev_rolling_avg === 'number',
          )
          setData(valid)
          setCurrZoom(zoom)
          if (valid.length === 0) {
            setError(
              'No data points with more than 4 samples found in the specified area. Try expanding the area.',
            )
          } else {
            setError(null)
          }
        } else {
          setError('Unexpected response format')
        }
      })
      .catch((err) => setError(String((err && (err as Error).message) || err)))
      .finally(() => setLoading(false))
  }, [JSON.stringify(bounds), zoom])

  return { data, loading, error, currZoom }
}

import { useEffect, useState } from 'react'

export interface VelocityAggregation {
  rounded_lon: number
  rounded_lat: number
  total_sample_count: number
  average_rolling_avg: number
  stddev_rolling_avg: number
}

export function useVelocityAggregationData(apiUrl: string) {
  const [data, setData] = useState<VelocityAggregation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data')
        return res.json()
      })
      .then((json: unknown) => {
        if (Array.isArray(json)) {
          const valid = json.filter(
            (item) =>
              typeof item.rounded_lon === 'number' &&
              typeof item.rounded_lat === 'number' &&
              typeof item.total_sample_count === 'number' &&
              typeof item.average_rolling_avg === 'number' &&
              typeof item.stddev_rolling_avg === 'number',
          )
          setData(valid)
          if (valid.length !== json.length) {
            setError('Some data items were invalid and ignored')
          } else {
            setError(null)
          }
        } else {
          setError('Unexpected response format')
        }
      })
      .catch((err) => setError(String((err && (err as Error).message) || err)))
      .finally(() => setLoading(false))
  }, [apiUrl])

  return { data, loading, error }
}

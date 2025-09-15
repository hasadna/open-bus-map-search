import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const API_URL =
  'https://open-bus-stride-api.hasadna.org.il/siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=2025-01-01T00%3A00%3A00&lon_min=34.25&lon_max=35.0&lat_min=29.5&lat_max=29.8&rounding_precision=2'

interface VelocityAggregation {
  rounded_lon: number
  rounded_lat: number
  total_sample_count: number
  average_rolling_avg: number
  stddev_rolling_avg: number
}

const VelocityHeatmapPage: React.FC = () => {
  const [data, setData] = useState<VelocityAggregation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data')
        return res.json()
      })
      .then((json: unknown) => {
        if (Array.isArray(json)) {
          // Validate each item
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
  }, [])

  return (
    <div>
      <h1>Velocity Aggregation Heatmap</h1>
      <p>This page will display a heatmap of velocity aggregation data.</p>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div style={{ height: '500px', width: '100%', margin: '16px 0' }}>
        <MapContainer
          center={[29.65, 34.6]}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          {data.map((point, idx) => (
            <Marker key={idx} position={[point.rounded_lat, point.rounded_lon]}>
              <Popup>
                <div>
                  <b>Avg velocity:</b> {point.average_rolling_avg.toFixed(1)} km/h<br />
                  <br />
                  <b>Stddev:</b> {point.stddev_rolling_avg.toFixed(1)}

                  <b>Samples:</b> {point.total_sample_count}
                  <br />
                  <br />
                  <br />
                  <b>Lat:</b> {point.rounded_lat}, <b>Lon:</b> {point.rounded_lon}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {data.length > 0 && (
        <div>
          <h2>Sample Data</h2>
          <pre style={{ maxHeight: 200, overflow: 'auto', background: '#eee', padding: 8 }}>
            {JSON.stringify(data.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default VelocityHeatmapPage

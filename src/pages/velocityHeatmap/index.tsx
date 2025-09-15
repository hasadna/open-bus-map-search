
import { MapContainer, TileLayer } from 'react-leaflet'
import { useVelocityAggregationData } from './useVelocityAggregationData'
import { VelocityHeatmapLegend } from './VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './VelocityHeatmapRectangles'
import 'leaflet/dist/leaflet.css'

const API_URL =
  'https://open-bus-stride-api.hasadna.org.il/siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=2025-01-01T00%3A00%3A00&lon_min=34.25&lon_max=35.0&lat_min=29.5&lat_max=29.8&rounding_precision=2'


const VelocityHeatmapPage: React.FC = () => {
  const { data, loading, error } = useVelocityAggregationData(API_URL)

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
          <VelocityHeatmapRectangles data={data} />
        </MapContainer>
      </div>
      <VelocityHeatmapLegend />
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

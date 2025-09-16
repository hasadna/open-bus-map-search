import React, { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { VelocityHeatmapLegend } from './components/VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './components/VelocityHeatmapRectangles'
import { useVelocityAggregationData } from './useVelocityAggregationData'
import 'leaflet/dist/leaflet.css'

const API_URL =
  'https://open-bus-stride-api.hasadna.org.il/siri_velocity_aggregation/siri_velocity_aggregation?recorded_from=2025-01-01T00%3A00%3A00&lon_min=34.25&lon_max=35.0&lat_min=29.5&lat_max=29.8&rounding_precision=2'

const VIS_MODES = [
  { key: 'avg', label: 'Visualize Avg Speed' },
  { key: 'std', label: 'Visualize Std' },
  { key: 'cv', label: 'Visualize Avg Speed / Std (Coeff of Var)' },
]

const VelocityHeatmapPage: React.FC = () => {
  const { data, loading, error } = useVelocityAggregationData(API_URL)
  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)

  return (
    <div>
      <h1>Velocity Aggregation Heatmap</h1>
      <p>This page will display a heatmap of velocity aggregation data.</p>
      <div style={{ margin: '12px 0' }}>
        <b>Visualization:</b>{' '}
        {VIS_MODES.map((mode) => (
          <label key={mode.key} style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="visMode"
              value={mode.key}
              checked={visMode === mode.key}
              onChange={() => setVisMode(mode.key as 'avg' | 'std' | 'cv')}
            />{' '}
            {mode.label}
          </label>
        ))}
      </div>
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
          <VelocityHeatmapRectangles
            data={data}
            visMode={visMode}
            setMinMax={(min, max) => {
              setMin(min)
              setMax(max)
            }}
          />
          <VelocityHeatmapLegend visMode={visMode} min={min} max={max} />
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

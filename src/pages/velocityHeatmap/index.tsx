import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { Dayjs } from 'dayjs'
import React, { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { VelocityHeatmapLegend } from './components/VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './components/VelocityHeatmapRectangles'
import { useVelocityAggregationData } from './useVelocityAggregationData'
import 'leaflet/dist/leaflet.css'

const DEFAULT_BOUNDS = {
  minLat: 29.5,
  maxLat: 33.33,
  minLon: 34.25,
  maxLon: 35.7,
}

const VIS_MODES = [
  { key: 'avg', label: 'Visualize Avg Speed' },
  { key: 'std', label: 'Visualize Std' },
  { key: 'cv', label: 'Visualize Std / Avg Speed (Coeff of Var)' },
]

const VelocityHeatmapPage: React.FC = () => {
  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)
  const [value, setValue] = React.useState<Dayjs | null>(dayjs(new Date()))

  const { data, loading, error } = useVelocityAggregationData({
    minLat: DEFAULT_BOUNDS.minLat,
    maxLat: DEFAULT_BOUNDS.maxLat,
    minLon: DEFAULT_BOUNDS.minLon,
    maxLon: DEFAULT_BOUNDS.maxLon,
    date: value,
  })

  return (
    <div>
      <h1>Velocity Aggregation Heatmap</h1>
      <p>This page will display a heatmap of velocity aggregation data.</p>
      <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '2rem' }}>
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            defaultValue={dayjs(new Date())}
            value={value}
            onChange={(newValue) => setValue(newValue)}
            label="בחר תאריך"
            sx={{ marginRight: 12 }}
          />
        </LocalizationProvider>
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

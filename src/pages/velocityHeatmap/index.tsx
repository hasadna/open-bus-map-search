import { Stack } from '@mui/material'
import React, { useContext, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import dayjs from 'src/dayjs'
import { SearchContext } from '../../model/pageState'
import { DateNavigator } from '../components/dateNavigator/DateNavigator'
import { DateSelector } from '../components/DateSelector'
import { VelocityHeatmapLegend } from './components/VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './components/VelocityHeatmapRectangles'
import 'leaflet/dist/leaflet.css'

const VIS_MODES = [
  { key: 'avg', label: 'Visualize Avg Speed' },
  { key: 'std', label: 'Visualize Std' },
  { key: 'cv', label: 'Visualize Std / Avg Speed (Coeff of Var)' },
]

const DEFAULT_ZOOM_LEVEL = 10

const VelocityHeatmapPage: React.FC = () => {
  const { search, setSearch } = useContext(SearchContext)

  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? +new Date('2026-01-01') }))
  }

  return (
    <div>
      <h1>Velocity Aggregation Heatmap</h1>
      <p>This page will display a heatmap of velocity aggregation data.</p>

      {/* choose date*/}
      <Stack direction="column" spacing={2} sx={{ mb: 2, width: { xs: '100%', md: '70%' } }}>
        <DateSelector time={dayjs(search.timestamp)} onChange={handleTimestampChange} />
        <DateNavigator currentTime={dayjs(search.timestamp)} onChange={handleTimestampChange} />
      </Stack>
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
      <div style={{ height: '500px', width: '100%', margin: '16px 0' }}>
        <MapContainer
          center={[29.65, 34.6]}
          zoom={DEFAULT_ZOOM_LEVEL}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <VelocityHeatmapRectangles
            visMode={visMode}
            setMinMax={(min, max) => {
              setMin(min)
              setMax(max)
            }}
          />
          <VelocityHeatmapLegend visMode={visMode} min={min} max={max} />
        </MapContainer>
      </div>
    </div>
  )
}

export default VelocityHeatmapPage

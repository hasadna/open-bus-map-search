import { OpenInFullRounded } from '@mui/icons-material'
import { Alert, CircularProgress, IconButton, Stack } from '@mui/material'
import React, { useCallback, useContext, useRef, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import dayjs from 'src/dayjs'
import { useConstrainedFloatingButton } from 'src/hooks/useConstrainedFloatingButton'
import { SearchContext } from '../../model/pageState'
import { DateNavigator } from '../components/dateNavigator/DateNavigator'
import { DateSelector } from '../components/DateSelector'
import { VelocityHeatmapLegend } from './components/VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './components/VelocityHeatmapRectangles'

const VIS_MODES = [
  { key: 'avg', label: 'Visualize Avg Speed' },
  { key: 'std', label: 'Visualize Std' },
  { key: 'cv', label: 'Visualize Std / Avg Speed (Coeff of Var)' },
]

const DEFAULT_ZOOM_LEVEL = 10

const VelocityHeatmapPage: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])

  const { search, setSearch } = useContext(SearchContext)

  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? +new Date('2026-01-01') }))
  }

  useConstrainedFloatingButton(mapContainerRef, buttonRef, isExpanded)

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

      <div ref={mapContainerRef} className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <IconButton
          ref={buttonRef}
          color="primary"
          className="expand-button"
          onClick={toggleExpanded}>
          <OpenInFullRounded fontSize="large" />
        </IconButton>
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1000,
              gap: 12,
            }}>
            <CircularProgress size={48} />
            <span style={{ fontSize: '1.1em', color: '#333' }}>Loading heatmap data...</span>
          </div>
        )}
        {errorMessage && !isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}>
            <Alert severity="error">{errorMessage}</Alert>
          </div>
        )}
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
            onLoadingChange={setIsLoading}
            onErrorChange={setErrorMessage}
          />
          <VelocityHeatmapLegend visMode={visMode} min={min} max={max} />
        </MapContainer>
      </div>
    </div>
  )
}

export default VelocityHeatmapPage

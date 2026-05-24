import { OpenInFullRounded } from '@mui/icons-material'
import { IconButton, Stack } from '@mui/material'
import React, { useCallback, useContext, useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet'
import dayjs from 'src/dayjs'
import { useConstrainedFloatingButton } from 'src/hooks/useConstrainedFloatingButton'
import { usePageState } from 'src/hooks/usePageState'
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

// Negev-centered default: the heatmap covers southern Israel where
// velocity variation is most prominent for demonstrations.
const DEFAULT_CENTER: [number, number] = [29.65, 34.6]
const DEFAULT_ZOOM = 10

const VelocityHeatmapPage: React.FC = () => {
  const { search, setSearch } = useContext(SearchContext)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // visMode, center, zoom go in params (shareable) — this map has no auto-fit,
  // so the recipient needs the viewport to see the same area.
  // isExpanded goes in ui — layout preference, device-specific.
  const { params, ui, setParams, setUi } = usePageState(
    'velocity-heatmap',
    {
      params: {
        visMode: 'avg' as 'avg' | 'std' | 'cv',
        centerLat: DEFAULT_CENTER[0],
        centerLng: DEFAULT_CENTER[1],
        zoom: DEFAULT_ZOOM,
      },
      ui: { isExpanded: false, scrollPosition: 0 },
    },
    ['visMode', 'centerLat', 'centerLng', 'zoom'],
  )

  const [min, setMin] = React.useState(0)
  const [max, setMax] = React.useState(1)

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({ ...current, date: time?.valueOf() ?? +new Date('2026-01-01') }))
  }

  const toggleExpanded = useCallback(
    () => setUi((prev) => ({ ...prev, isExpanded: !prev.isExpanded })),
    [setUi],
  )

  useConstrainedFloatingButton(mapContainerRef, buttonRef, ui.isExpanded)

  return (
    <div>
      <h1>Velocity Aggregation Heatmap</h1>
      <p>This page will display a heatmap of velocity aggregation data.</p>

      <Stack direction="column" spacing={2} sx={{ mb: 2, width: { xs: '100%', md: '70%' } }}>
        <DateSelector time={dayjs(search.date)} onChange={handleDateChange} />
        <DateNavigator currentTime={dayjs(search.date)} onChange={handleDateChange} />
      </Stack>

      <div style={{ margin: '12px 0' }}>
        <b>Visualization:</b>{' '}
        {VIS_MODES.map((mode) => (
          <label key={mode.key} style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="visMode"
              value={mode.key}
              checked={params.visMode === mode.key}
              onChange={() =>
                setParams((prev) => ({ ...prev, visMode: mode.key as 'avg' | 'std' | 'cv' }))
              }
            />{' '}
            {mode.label}
          </label>
        ))}
      </div>

      <div ref={mapContainerRef} className={`map-info ${ui.isExpanded ? 'expanded' : 'collapsed'}`}>
        <IconButton
          ref={buttonRef}
          color="primary"
          className="expand-button"
          onClick={toggleExpanded}>
          <OpenInFullRounded fontSize="large" />
        </IconButton>
        <MapContainer
          center={[params.centerLat, params.centerLng]}
          zoom={params.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <MapViewportTracker
            onViewportChange={(centerLat, centerLng, zoom) =>
              setParams((prev) => ({ ...prev, centerLat, centerLng, zoom }))
            }
          />
          <VelocityHeatmapRectangles
            visMode={params.visMode}
            setMinMax={(min, max) => {
              setMin(min)
              setMax(max)
            }}
          />
          <VelocityHeatmapLegend visMode={params.visMode} min={min} max={max} />
        </MapContainer>
      </div>
    </div>
  )
}

/** Persists map viewport so the share URL reproduces the same area. */
function MapViewportTracker({
  onViewportChange,
}: {
  onViewportChange: (lat: number, lng: number, zoom: number) => void
}) {
  useMapEvents({
    moveend(e) {
      const map = e.target as {
        getCenter: () => { lat: number; lng: number }
        getZoom: () => number
      }
      const c = map.getCenter()
      onViewportChange(c.lat, c.lng, map.getZoom())
    },
  })
  return null
}

export default VelocityHeatmapPage

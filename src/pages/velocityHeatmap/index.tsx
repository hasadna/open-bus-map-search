import { OpenInFullRounded } from '@mui/icons-material'
import { FormControlLabel, IconButton, Radio, RadioGroup, Stack, Typography } from '@mui/material'
import React, { useCallback, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AttributionControl,
  MapContainer,
  TileLayer,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { useConstrainedFloatingButton } from 'src/hooks/useConstrainedFloatingButton'
import { usePageState } from 'src/hooks/usePageState'
import { GlobalSearchContext } from 'src/model/globalState'
import { DateNavigator } from '../components/dateNavigator/DateNavigator'
import { DateSelector } from '../components/DateSelector'
import { PageContainer } from '../components/PageContainer'
import { VelocityHeatmapLegend } from './components/VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './components/VelocityHeatmapRectangles'

const VIS_MODES = [
  { key: 'avg', labelKey: 'velocity_vis_avg' },
  { key: 'std', labelKey: 'velocity_vis_std' },
  { key: 'cv', labelKey: 'velocity_vis_cv' },
] as const

// Negev-centered default: the heatmap covers southern Israel where
// velocity variation is most prominent for demonstrations.
const DEFAULT_CENTER: [number, number] = [29.65, 34.6]
const DEFAULT_ZOOM = 10

const VelocityHeatmapPage: React.FC = () => {
  const { search, setSearch } = useContext(GlobalSearchContext)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  // visMode, center, zoom go in params (shareable) — this map has no auto-fit,
  // so the recipient needs the viewport to see the same area.
  // isExpanded goes in ui — layout preference, device-specific.
  const { params, ui, setParams, setUi } = usePageState(
    'velocity-heatmap',
    {
      params: {
        visMode: 'avg',
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
    setSearch((current) => ({
      ...current,
      date: toIsraelTimezone(time ?? dayjs()).format('YYYY-MM-DD'),
    }))
  }

  const toggleExpanded = useCallback(
    () => setUi((prev) => ({ ...prev, isExpanded: !prev.isExpanded })),
    [setUi],
  )

  useConstrainedFloatingButton(mapContainerRef, buttonRef, ui.isExpanded)

  return (
    <PageContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('velocity_heatmap_page_title')}
      </Typography>

      <Stack direction="column" spacing={2} sx={{ maxWidth: 600 }}>
        <DateSelector time={dayjs.tz(search.date, ISRAEL_TIMEZONE)} onChange={handleDateChange} />
        <DateNavigator
          currentTime={dayjs.tz(search.date, ISRAEL_TIMEZONE)}
          onChange={handleDateChange}
        />
      </Stack>
      <RadioGroup
        row
        name="visMode"
        value={params.visMode}
        onChange={(e) => setParams((prev) => ({ ...prev, visMode: e.target.value }))}
        sx={{ flexWrap: 'wrap', mt: 2 }}>
        {VIS_MODES.map((mode) => (
          <FormControlLabel
            key={mode.key}
            value={mode.key}
            control={<Radio size="small" />}
            label={t(mode.labelKey)}
          />
        ))}
      </RadioGroup>

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
          zoomControl={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}>
          <ZoomControl position={isRtl ? 'topleft' : 'topright'} />
          <AttributionControl position={isRtl ? 'bottomright' : 'bottomleft'} prefix={false} />
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
    </PageContainer>
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

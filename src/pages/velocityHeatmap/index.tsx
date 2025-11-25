import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer } from 'react-leaflet'
import { PageContainer } from '../components/PageContainer'
import { VelocityHeatmapLegend } from './components/VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './components/VelocityHeatmapRectangles'
import 'leaflet/dist/leaflet.css'

const VIS_MODES = ['avg', 'std', 'cv'] as const
const DEFAULT_ZOOM_LEVEL = 10

const VelocityHeatmapPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [visMode, setVisMode] = useState<(typeof VIS_MODES)[number]>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)

  return (
    <PageContainer className="velocity-heatmap-page-container">
      <Typography variant="h4">{t('velocity_heatmap_page_title')}</Typography>
      <p>{t('velocity_heatmap_page_description')}</p>
      <span>{t('visualization')}</span>
      <ToggleButtonGroup
        color={'primary'}
        value={visMode}
        disabled={!visMode}
        sx={{ height: 56 }}
        exclusive
        dir="rtl"
        onChange={(_, value: (typeof VIS_MODES)[number]) =>
          value ? setVisMode(value) : undefined
        }>
        {(i18n.dir() === 'rtl' ? VIS_MODES : VIS_MODES.toReversed()).map((value) => (
          <ToggleButton key={value} value={value}>
            {t(`velocity_heatmap_visualization_options_${value}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {loading && <p>{t(`loading`)}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div style={{ height: '500px', width: '100%', margin: '16px 0' }}>
        <MapContainer
          center={[29.65, 34.6]}
          zoom={DEFAULT_ZOOM_LEVEL}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', color: 'black' }}>
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

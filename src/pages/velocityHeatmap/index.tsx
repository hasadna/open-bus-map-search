import { OpenInFullRounded } from '@mui/icons-material'
import { FormControlLabel, IconButton, Radio, RadioGroup, Stack, Typography } from '@mui/material'
import React, { useCallback, useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer } from 'react-leaflet'
import dayjs from 'src/dayjs'
import { useConstrainedFloatingButton } from 'src/hooks/useConstrainedFloatingButton'
import { SearchContext } from '../../model/pageState'
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

const VIS_MODE_LABELS: Record<string, string> = {
  avg: 'Average Speed',
  std: 'Standard Deviation',
  cv: 'Coefficient of Variation',
}

const DEFAULT_ZOOM_LEVEL = 10

const VelocityHeatmapPage: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const toggleExpanded = useCallback(() => setIsExpanded((expanded) => !expanded), [])
  const { t } = useTranslation()

  const { search, setSearch } = useContext(SearchContext)

  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleTimestampChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({ ...current, timestamp: time?.valueOf() ?? +new Date('2026-01-01') }))
  }

  useConstrainedFloatingButton(mapContainerRef, buttonRef, isExpanded)

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        {t('velocity_page_title', { defaultValue: 'Velocity Heatmap' })}
      </Typography>

      <Stack direction="column" spacing={2} sx={{ maxWidth: 600 }}>
        <DateSelector time={dayjs(search.timestamp)} onChange={handleTimestampChange} />
        <DateNavigator currentTime={dayjs(search.timestamp)} onChange={handleTimestampChange} />
        <RadioGroup
          row
          value={visMode}
          onChange={(e) => setVisMode(e.target.value as 'avg' | 'std' | 'cv')}>
          {VIS_MODES.map((mode) => (
            <FormControlLabel
              key={mode.key}
              value={mode.key}
              control={<Radio size="small" />}
              label={t(mode.labelKey, { defaultValue: VIS_MODE_LABELS[mode.key] })}
            />
          ))}
        </RadioGroup>
      </Stack>

      <div ref={mapContainerRef} className={`map-info ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <IconButton
          ref={buttonRef}
          color="primary"
          className="expand-button"
          onClick={toggleExpanded}>
          <OpenInFullRounded fontSize="large" />
        </IconButton>
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
    </PageContainer>
  )
}

export default VelocityHeatmapPage

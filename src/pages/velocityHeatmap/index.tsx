import {
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TileLayer } from 'react-leaflet'
import dayjs, { ISRAEL_TIMEZONE, toIsraelTimezone } from 'src/dayjs'
import { usePageState } from 'src/hooks/usePageState'
import { GlobalSearchContext } from 'src/model/globalState'
import { MapShell } from 'src/pages/components/map-related/MapShell'
import { DateNavigator } from '../components/dateNavigator/DateNavigator'
import { DateSelector } from '../components/DateSelector'
import { PageContainer } from '../components/PageContainer'
import { VelocityHeatmapLegend } from './components/VelocityHeatmapLegend'
import { VelocityHeatmapRectangles, type VisMode } from './components/VelocityHeatmapRectangles'

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
  const { t } = useTranslation()
  const theme = useTheme()
  // Long labels are cramped as 3 columns on a phone, so stack the selector
  // vertically (one button per row) there and keep a single row on wider screens.
  const stackVisSelector = useMediaQuery(theme.breakpoints.down('sm'))
  const dateDayjs = dayjs.tz(search.date, ISRAEL_TIMEZONE)

  // visMode goes in params (shareable) — the recipient sees the same
  // visualization. Map viewport/expansion are left to MapShell's own state.
  const { params, setParams } = usePageState<{ visMode: VisMode }, { scrollPosition: number }>(
    'velocity-heatmap',
    {
      params: { visMode: 'avg' },
      ui: { scrollPosition: 0 },
    },
    ['visMode'],
  )

  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({
      ...current,
      date: toIsraelTimezone(time ?? dayjs()).format('YYYY-MM-DD'),
    }))
  }

  const handleVisModeChange = (_: React.MouseEvent<HTMLElement>, value: VisMode | null) => {
    if (value) setParams((prev) => ({ ...prev, visMode: value }))
  }

  return (
    <PageContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('velocity_heatmap_page_title')}
      </Typography>

      {/* choose date + visualization — centered block */}
      <Box sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}>
        <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
          <DateSelector time={dateDayjs} onChange={handleDateChange} />
          <DateNavigator currentTime={dateDayjs} onChange={handleDateChange} />
        </Stack>
        <ToggleButtonGroup
          value={params.visMode}
          color="primary"
          exclusive
          fullWidth
          orientation={stackVisSelector ? 'vertical' : 'horizontal'}
          onChange={handleVisModeChange}
          sx={{ mt: 2 }}>
          {VIS_MODES.map((mode) => (
            <ToggleButton key={mode.key} value={mode.key}>
              {t(mode.labelKey)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <MapShell
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        legend={<VelocityHeatmapLegend visMode={params.visMode} min={min} max={max} />}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        <VelocityHeatmapRectangles
          visMode={params.visMode}
          setMinMax={(min, max) => {
            setMin(min)
            setMax(max)
          }}
        />
      </MapShell>
    </PageContainer>
  )
}

export default VelocityHeatmapPage

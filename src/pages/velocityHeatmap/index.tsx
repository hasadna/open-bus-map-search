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
import dayjs, { formatIsraelDate, parseIsraelDate, todayIsraelDate } from 'src/dayjs'
import { GlobalSearchContext } from 'src/model/globalState'
import { MapShell } from 'src/pages/components/map-related/MapShell'
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

const DEFAULT_ZOOM_LEVEL = 10

const VelocityHeatmapPage: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  // Long labels are cramped as 3 columns on a phone, so stack the selector
  // vertically (one button per row) there and keep a single row on wider screens.
  const stackVisSelector = useMediaQuery(theme.breakpoints.down('sm'))

  const { search, setSearch } = useContext(GlobalSearchContext)
  const dateDayjs = parseIsraelDate(search.date)

  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)

  const setDate = (date: string) => setSearch((current) => ({ ...current, date }))

  const handleDateChange = (time: dayjs.Dayjs | null) =>
    setDate(time ? formatIsraelDate(time) : todayIsraelDate())

  const handleVisModeChange = (
    _: React.MouseEvent<HTMLElement>,
    value: 'avg' | 'std' | 'cv' | null,
  ) => {
    if (value) setVisMode(value)
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
          <DateNavigator currentTime={search.date} onChange={setDate} />
        </Stack>
        <ToggleButtonGroup
          value={visMode}
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
        center={[29.65, 34.6]}
        zoom={DEFAULT_ZOOM_LEVEL}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        legend={<VelocityHeatmapLegend visMode={visMode} min={min} max={max} />}>
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
      </MapShell>
    </PageContainer>
  )
}

export default VelocityHeatmapPage

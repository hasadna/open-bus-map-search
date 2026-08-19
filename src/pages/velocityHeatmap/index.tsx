import {
  Box,
  CircularProgress,
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
  const dateDayjs = dayjs.tz(search.date, ISRAEL_TIMEZONE)

  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({
      ...current,
      date: toIsraelTimezone(time ?? dayjs()).format('YYYY-MM-DD'),
    }))
  }

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
          <DateNavigator currentTime={dateDayjs} onChange={handleDateChange} />
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

      <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
        {(loading || hasError) && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              pointerEvents: 'none',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(40, 40, 40, 0.92)'
                  : 'rgba(255, 255, 255, 0.9)',
            }}>
            {loading && <CircularProgress />}
            <Typography
              variant="h6"
              component="span"
              sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
              {hasError ? t('loading_error') : t('loading')}
            </Typography>
          </Box>
        )}
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
            setStatus={(loading, hasError) => {
              setLoading(loading)
              setHasError(hasError)
            }}
          />
        </MapShell>
      </Box>
    </PageContainer>
  )
}

export default VelocityHeatmapPage

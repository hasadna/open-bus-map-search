import { FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material'
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

  const { search, setSearch } = useContext(GlobalSearchContext)
  const dateDayjs = dayjs.tz(search.date, ISRAEL_TIMEZONE)

  const [visMode, setVisMode] = useState<'avg' | 'std' | 'cv'>('avg')
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(1)

  const handleDateChange = (time: dayjs.Dayjs | null) => {
    setSearch((current) => ({
      ...current,
      date: toIsraelTimezone(time ?? dayjs()).format('YYYY-MM-DD'),
    }))
  }

  return (
    <PageContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('velocity_heatmap_page_title')}
      </Typography>

      {/* choose date*/}
      <Stack direction="column" spacing={2} sx={{ mb: 2, width: { xs: '100%', md: '70%' } }}>
        <DateSelector time={dateDayjs} onChange={handleDateChange} />
        <DateNavigator currentTime={dateDayjs} onChange={handleDateChange} />
      </Stack>
      <RadioGroup
        row
        name="visMode"
        value={visMode}
        onChange={(e) => setVisMode(e.target.value as 'avg' | 'std' | 'cv')}
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

      <MapShell
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
      </MapShell>
    </PageContainer>
  )
}

export default VelocityHeatmapPage

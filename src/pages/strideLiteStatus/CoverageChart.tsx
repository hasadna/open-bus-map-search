import { Box, Stack, Typography, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { civilDateToDayjs } from 'src/model/time/civilDate'
import type { CoverageDayHealth } from './coverageHealth'
import { HEALTH_ORDER } from './coverageHealth'
import { healthColor, HealthIcon, healthLabelKey } from './healthDisplay'

type Metric = 'snapshots' | 'vehicleLocations'

type ChartRow = CoverageDayHealth & {
  label: string
  expected: number | undefined
}

const CoverageTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartRow }>
}) => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const compact = new Intl.NumberFormat(i18n.language, { notation: 'compact' })
  const full = new Intl.NumberFormat(i18n.language)

  const row = active ? payload?.[0]?.payload : undefined
  if (!row) return null

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
      <Typography variant="subtitle2">
        {civilDateToDayjs(row.day).format('dddd, DD/MM/YYYY')}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: 'center', color: healthColor(row.health, isDark) }}>
        <HealthIcon health={row.health} />
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {t(healthLabelKey(row.health))}
        </Typography>
      </Stack>
      <Typography variant="body2">
        {t('strideLite.snapshots')}: {full.format(row.snapshots)}
      </Typography>
      <Typography variant="body2">
        {t('strideLite.vehicle_locations')}: {full.format(row.vehicleLocations)}
      </Typography>
      <Typography variant="body2">
        {t('strideLite.duplicate_ids')}: {full.format(row.duplicateIds)}
      </Typography>
      <Typography variant="body2">
        {t('strideLite.rides')}: {full.format(row.rides)} ·{' '}
        {t('strideLite.rides_linked_to_gtfs')}: {full.format(row.ridesLinkedToGtfs)}
      </Typography>
      {row.expected !== undefined && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('strideLite.expected')}: {compact.format(row.expected)}
        </Typography>
      )}
    </Box>
  )
}

export const CoverageChart = ({
  days,
  metric,
  expectedFor,
}: {
  days: CoverageDayHealth[]
  metric: Metric
  /** Drawn as a second series in the same units as `metric` — never a second y axis. */
  expectedFor?: (day: CoverageDayHealth) => number
}) => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const compact = new Intl.NumberFormat(i18n.language, { notation: 'compact' })
  const full = new Intl.NumberFormat(i18n.language)
  const data = days.map((day) => ({
    ...day,
    label: civilDateToDayjs(day.day).format('DD/MM'),
    expected: expectedFor?.(day),
  }))
  const constantExpectation =
    expectedFor && new Set(data.map((row) => row.expected)).size === 1
      ? data[0]?.expected
      : undefined

  return (
    <Box>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={data}
          barCategoryGap="15%"
          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke={theme.palette.divider} />
          <XAxis
            dataKey="label"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            interval={Math.max(0, Math.floor(data.length / 8) - 1)}
            stroke={theme.palette.divider}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={(value: number) => compact.format(value)}
            stroke={theme.palette.divider}
            width={56}
          />
          <Tooltip content={<CoverageTooltip />} />
          <Bar
            dataKey={metric}
            radius={[4, 4, 0, 0]}
            // A day with nothing in it still gets a stub, so "no data arrived" reads as a
            // marked day rather than as a date the chart happens not to cover.
            minPointSize={4}
            isAnimationActive={false}>
            {data.map((row) => (
              <Cell key={row.day} fill={healthColor(row.health, isDark)} />
            ))}
          </Bar>
          {constantExpectation !== undefined ? (
            <ReferenceLine
              y={constantExpectation}
              stroke={theme.palette.text.secondary}
              strokeDasharray="4 4"
            />
          ) : (
            expectedFor && (
              <Line
                type="stepAfter"
                dataKey="expected"
                stroke={theme.palette.text.secondary}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            )
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
        {HEALTH_ORDER.map((health) => (
          <Stack key={health} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ color: healthColor(health, isDark), display: 'flex' }}>
              <HealthIcon health={health} />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t(healthLabelKey(health))}
            </Typography>
          </Stack>
        ))}
        {expectedFor && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('strideLite.expected_legend')}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

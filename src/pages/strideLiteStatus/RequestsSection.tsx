import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  STRIDE_LITE_REQUEST_WINDOWS,
  type StrideLiteOpsMetrics,
  strideLiteOpsMetricsQueryOptions,
  strideLiteOpsRequestsQueryOptions,
  type StrideLiteRequests,
  type StrideLiteRequestWindow,
} from 'src/api/strideLite'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import { useFormats } from './formats'

/** The row the backend folds every unnamed non-endpoint path into. */
const OTHER_PATHS = 'other'
const WINDOW_MS: Record<StrideLiteRequestWindow, number> = {
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
}
const BAR_COLOR = { light: '#2a78d6', dark: '#3987e5' }

type Bucket = StrideLiteRequests['buckets'][number]

const BucketTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: Bucket }>
}) => {
  const { t } = useTranslation()
  const f = useFormats()
  const bucket = active ? payload?.[0]?.payload : undefined
  if (!bucket) return null
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
      <Typography variant="subtitle2">{f.dateTime(bucket.start)}</Typography>
      <Typography variant="body2">
        {t('strideLite.requests')}: {f.count(bucket.requests)}
      </Typography>
      <Typography variant="body2">
        {t('strideLite.server_errors')}: {f.count(bucket.errors)}
      </Typography>
      {bucket.p95 !== null && (
        <Typography variant="body2">
          {t('strideLite.p95')}: {f.ms(bucket.p95)}
        </Typography>
      )}
    </Box>
  )
}

const RequestsChart = ({
  buckets,
  window,
}: {
  buckets: Bucket[]
  window: StrideLiteRequestWindow
}) => {
  const f = useFormats()
  const theme = useTheme()
  const tick = (iso: string) => (window === 'week' ? f.dateTime(iso) : f.time(iso).slice(0, 5))
  return (
    <Box dir="ltr">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={buckets} margin={{ left: 0, right: 8 }} barCategoryGap={1}>
          <CartesianGrid vertical={false} stroke={theme.palette.divider} />
          <XAxis
            dataKey="start"
            tickFormatter={tick}
            minTickGap={40}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            width={40}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<BucketTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar
            dataKey="requests"
            fill={BAR_COLOR[theme.palette.mode === 'dark' ? 'dark' : 'light']}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

const RequestsTable = ({ rows }: { rows: NonNullable<StrideLiteOpsMetrics['apiRequests']> }) => {
  const { t } = useTranslation()
  const f = useFormats()
  if (rows.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {t('strideLite.no_requests')}
      </Typography>
    )
  }
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        <TableHead>
          <TableRow>
            <TableCell>{t('strideLite.endpoint')}</TableCell>
            <TableCell align="right">{t('strideLite.requests')}</TableCell>
            <TableCell align="right">{t('strideLite.server_errors')}</TableCell>
            <TableCell align="right">{t('strideLite.median')}</TableCell>
            <TableCell align="right">{t('strideLite.p95')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.path}>
              {row.path === OTHER_PATHS && !row.endpoint ? (
                <TableCell sx={{ color: 'text.secondary' }}>
                  {t('strideLite.other_paths')}
                </TableCell>
              ) : (
                <TableCell
                  sx={{
                    fontFamily: 'monospace',
                    color: row.endpoint ? 'text.primary' : 'text.secondary',
                    wordBreak: 'break-all',
                  }}>
                  {row.path}
                  {!row.endpoint && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ fontFamily: 'inherit', ms: 1 }}>
                      {t('strideLite.not_endpoint')}
                    </Typography>
                  )}
                </TableCell>
              )}
              <TableCell align="right">{f.count(row.requests)}</TableCell>
              <TableCell align="right">{f.count(row.errors)}</TableCell>
              <TableCell align="right">{f.ms(row.p50)}</TableCell>
              <TableCell align="right">{f.ms(row.p95)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

export const RequestsSection = () => {
  const { t } = useTranslation()
  const f = useFormats()
  const [window, setWindow] = useState<StrideLiteRequestWindow>('hour')
  const requests = useQuery(strideLiteOpsRequestsQueryOptions(window))
  const metrics = useQuery(strideLiteOpsMetricsQueryOptions())

  const toggle = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={window}
      onChange={(_, value: StrideLiteRequestWindow | null) => value && setWindow(value)}
      aria-label={t('strideLite.requests_window')}>
      {STRIDE_LITE_REQUEST_WINDOWS.map((w) => (
        <ToggleButton key={w} value={w} sx={{ textTransform: 'none' }}>
          {t(`strideLite.window_${w}`)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )

  if (requests.isLoading) return <SkeletonLoader />

  // A backend older than /ops/requests still reports the last hour with its metrics.
  if (!requests.data) {
    const lastHour = metrics.data?.apiRequests
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('strideLite.requests_windows_unavailable')}
        </Typography>
        {lastHour ? <RequestsTable rows={lastHour} /> : <SkeletonLoader />}
      </Stack>
    )
  }

  const { from, to, buckets, rows } = requests.data
  const remembersLess = Date.parse(from) > Date.parse(to) - WINDOW_MS[window] + 60_000

  return (
    <Stack spacing={2}>
      {toggle}
      {remembersLess && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('strideLite.requests_since', { time: f.dateTime(from) })}
        </Typography>
      )}
      <RequestsChart buckets={buckets} window={window} />
      <RequestsTable rows={rows} />
    </Stack>
  )
}

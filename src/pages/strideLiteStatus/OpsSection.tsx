import {
  Alert,
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  STRIDE_LITE_LOG_SOURCES,
  type StrideLiteLogSource,
  strideLiteOpsLogsQueryOptions,
  strideLiteOpsMetricsQueryOptions,
} from 'src/api/strideLite'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import { StatTile, Unreachable } from './statusParts'

/** Below this share of free disk a merge may not find room to write its result. */
const LOW_DISK_SHARE = 0.15
const LARGEST_TABLES = 8
const LOG_LINES = 200
/** The row the backend folds every unnamed non-endpoint path into. */
const OTHER_PATHS = 'other'

const useFormats = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const count = new Intl.NumberFormat(lang)
  const gigabytes = new Intl.NumberFormat(lang, {
    style: 'unit',
    unit: 'gigabyte',
    maximumFractionDigits: 1,
  })
  const days = new Intl.NumberFormat(lang, { style: 'unit', unit: 'day', maximumFractionDigits: 1 })
  const ms = new Intl.NumberFormat(lang, { style: 'unit', unit: 'millisecond' })
  const percent = new Intl.NumberFormat(lang, { style: 'percent' })
  const load = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 })
  return {
    count: (n: number) => count.format(n),
    bytes: (n: number) => gigabytes.format(n / 1e9),
    days: (seconds: number) => days.format(seconds / 86_400),
    ms: (n: number) => ms.format(n),
    percent: (share: number) => percent.format(share),
    load: (n: number) => load.format(n),
  }
}

export const NodeSection = () => {
  const { t } = useTranslation()
  const f = useFormats()
  const { data, error, isLoading } = useQuery(strideLiteOpsMetricsQueryOptions())

  if (error) return <Unreachable error={error} />
  if (isLoading || !data) return <SkeletonLoader />

  const disk = data.disks?.[0]
  const freeShare = disk ? disk.free / disk.total : null
  const failing = data.refreshes?.filter((r) => r.exception !== '') ?? []
  const loadTile = ({ load1, load15, cpus }: NonNullable<typeof data.server>) => {
    const raw = `${f.load(load1)} / ${f.load(load15)}`
    if (!cpus) return { label: t('strideLite.load_average'), value: raw }
    return {
      label: t('strideLite.cpu_demand'),
      value: `${f.percent(load1 / cpus)} / ${f.percent(load15 / cpus)}`,
      detail: t('strideLite.load_on_cores', {
        load: raw,
        count: cpus,
        interpolation: { escapeValue: false },
      }),
    }
  }
  const tiles = [
    disk && {
      label: t('strideLite.disk_free'),
      value: t('strideLite.of_total', { part: f.bytes(disk.free), total: f.bytes(disk.total) }),
    },
    data.server && {
      label: t('strideLite.memory_available'),
      value: t('strideLite.of_total', {
        part: f.bytes(data.server.memoryAvailable),
        total: f.bytes(data.server.memoryTotal),
      }),
    },
    data.server && loadTile(data.server),
    data.server && { label: t('strideLite.uptime'), value: f.days(data.server.uptimeSeconds) },
    data.server && { label: t('strideLite.clickhouse_version'), value: data.server.version },
  ].filter((tile) => !!tile)

  return (
    <Stack spacing={3}>
      {freeShare !== null && freeShare < LOW_DISK_SHARE && (
        <Alert severity="warning">
          {t('strideLite.disk_low', { percent: Math.round(freeShare * 100) })}
        </Alert>
      )}
      {failing.map((r) => (
        <Alert key={r.view} severity="error">
          {`${r.view}: ${r.exception}`}
        </Alert>
      ))}
      <Grid container spacing={2}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <StatTile {...tile} />
          </Grid>
        ))}
      </Grid>

      {data.tables && (
        <Box>
          <Typography variant="subtitle1">{t('strideLite.largest_tables')}</Typography>
          <Table size="small" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('strideLite.table')}</TableCell>
                <TableCell align="right">{t('strideLite.rows')}</TableCell>
                <TableCell align="right">{t('strideLite.size_on_disk')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.tables.slice(0, LARGEST_TABLES).map((row) => (
                <TableRow key={row.table}>
                  <TableCell>{row.table}</TableCell>
                  <TableCell align="right">{f.count(row.rows)}</TableCell>
                  <TableCell align="right">{f.bytes(row.bytes)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {data.apiRequests && (
        <Box>
          <Typography variant="subtitle1">{t('strideLite.api_last_hour')}</Typography>
          {data.apiRequests.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('strideLite.no_requests')}
            </Typography>
          ) : (
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
                {data.apiRequests.map((row) => (
                  <TableRow key={row.path}>
                    {row.path === OTHER_PATHS ? (
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
          )}
        </Box>
      )}

      {data.errors && data.errors.length > 0 && (
        <Box>
          <Typography variant="subtitle1">{t('strideLite.errors_last_day')}</Typography>
          <Table size="small" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('strideLite.error_name')}</TableCell>
                <TableCell align="right">{t('strideLite.times')}</TableCell>
                <TableCell>{t('strideLite.last_message')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.errors.map((row) => (
                <TableRow key={row.name}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{row.name}</TableCell>
                  <TableCell align="right">{f.count(row.count)}</TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>{row.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  )
}

export const LogsSection = () => {
  const { t } = useTranslation()
  const [source, setSource] = useState<StrideLiteLogSource>(STRIDE_LITE_LOG_SOURCES[0])
  const { data, error, isLoading } = useQuery(strideLiteOpsLogsQueryOptions(source, LOG_LINES))

  return (
    <Stack spacing={2}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={source}
        onChange={(_, value: StrideLiteLogSource | null) => value && setSource(value)}
        aria-label={t('strideLite.log_source')}
        sx={{ flexWrap: 'wrap' }}>
        {STRIDE_LITE_LOG_SOURCES.map((name) => (
          <ToggleButton key={name} value={name} sx={{ textTransform: 'none' }}>
            {name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {error ? (
        <Unreachable error={error} />
      ) : isLoading || !data ? (
        <SkeletonLoader />
      ) : data.missing ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('strideLite.log_missing')}
        </Typography>
      ) : (
        <Box
          component="pre"
          dir="ltr"
          sx={{
            m: 0,
            p: 1.5,
            maxHeight: 480,
            overflow: 'auto',
            fontSize: 12,
            bgcolor: 'action.hover',
            borderRadius: 1,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
          {data.lines.join('\n')}
        </Box>
      )}
    </Stack>
  )
}

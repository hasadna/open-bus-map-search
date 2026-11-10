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
import { useFormats } from './formats'
import { StatTile, Unreachable } from './statusParts'

/** Below this share of free disk a merge may not find room to write its result. */
const LOW_DISK_SHARE = 0.15
const LOG_LINES = 200

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
    const raw = `${f.decimal(load1)} / ${f.decimal(load15)}`
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

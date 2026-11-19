import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { strideLiteOpsMetricsQueryOptions } from 'src/api/strideLite'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import { useFormats } from './formats'
import { Unreachable } from './statusParts'

type Kind = 'refresh' | 'merge' | 'mutation' | 'query'
type Activity = { kind: Kind; what: string; seconds: number | null; detail: string }

const KIND_ORDER: Kind[] = ['query', 'refresh', 'merge', 'mutation']

/** Everything the node is busy with right now, longest-running first within each kind. */
export const ActivitySection = () => {
  const { t } = useTranslation()
  const f = useFormats()
  const { data, error, isLoading } = useQuery(strideLiteOpsMetricsQueryOptions())

  if (error) return <Unreachable error={error} />
  if (isLoading || !data) return <SkeletonLoader />

  const measuredAt = Date.parse(data.measuredAt)
  const refreshes = data.refreshes ?? []
  const statusCounts = new Map<string, number>()
  for (const r of refreshes) statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1)

  const rows: Activity[] = [
    ...(data.processes ?? []).map((p): Activity => ({
      kind: 'query',
      what: p.shape,
      seconds: p.elapsed,
      detail: t('strideLite.activity_query_detail', {
        rows: f.compact(p.readRows),
        memory: f.bytes(p.memory),
      }),
    })),
    ...refreshes
      .filter((r) => r.status === 'Running')
      .map((r): Activity => ({
        kind: 'refresh',
        what: r.view,
        seconds: r.lastRefreshTime ? (measuredAt - Date.parse(r.lastRefreshTime)) / 1000 : null,
        detail: r.lastSuccessTime
          ? t('strideLite.activity_last_success', { time: f.time(r.lastSuccessTime) })
          : '',
      })),
    ...(data.merges ?? []).map((m): Activity => ({
      kind: m.isMutation ? 'mutation' : 'merge',
      what: m.table,
      seconds: m.elapsed,
      detail: t('strideLite.activity_merge_detail', {
        progress: f.percent(m.progress),
        size: f.bytes(m.bytes),
      }),
    })),
    ...(data.mutations ?? [])
      .filter((m) => !m.isDone)
      .map((m): Activity => ({
        kind: 'mutation',
        what: `${m.table}: ${m.command}`,
        seconds: null,
        detail: t('strideLite.activity_parts_to_do', { count: m.partsToDo }),
      })),
  ].sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      (b.seconds ?? 0) - (a.seconds ?? 0),
  )

  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 820 }}>
        {t('strideLite.activity_help')}
      </Typography>
      {statusCounts.size > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: 'wrap', alignItems: 'center', rowGap: 1 }}>
          <Typography variant="body2">{t('strideLite.refresh_views')}:</Typography>
          {[...statusCounts].map(([status, count]) => (
            <Chip
              key={status}
              size="small"
              variant="outlined"
              label={`${status} · ${f.count(count)}`}
            />
          ))}
        </Stack>
      )}
      {rows.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('strideLite.activity_idle')}
        </Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('strideLite.kind')}</TableCell>
                <TableCell>{t('strideLite.activity_what')}</TableCell>
                <TableCell align="right">{t('strideLite.activity_running_for')}</TableCell>
                <TableCell>{t('strideLite.activity_detail')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={`${row.kind}-${row.what}-${i}`}>
                  <TableCell>{t(`strideLite.activity_kind_${row.kind}`)}</TableCell>
                  <TableCell
                    title={row.what}
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      maxWidth: 520,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                    {row.what}
                  </TableCell>
                  <TableCell align="right">
                    {row.seconds === null ? '—' : f.duration(row.seconds)}
                  </TableCell>
                  <TableCell>{row.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  )
}

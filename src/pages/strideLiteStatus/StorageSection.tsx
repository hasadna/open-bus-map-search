import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { type StrideLiteOpsMetrics, strideLiteOpsMetricsQueryOptions } from 'src/api/strideLite'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import { useFormats } from './formats'
import { Unreachable } from './statusParts'

const TABLES_CHARTED = 10
const BAR_ROW_HEIGHT = 34

/** Categorical slots in fixed order, validated for colour-blind separation in both modes. */
const SERIES = {
  light: {
    columns: '#2a78d6',
    projections: '#eb6834',
    primaryKey: '#1baf7a',
    skipIndexes: '#eda100',
  },
  dark: {
    columns: '#3987e5',
    projections: '#d95926',
    primaryKey: '#199e70',
    skipIndexes: '#c98500',
  },
}
type Part = keyof (typeof SERIES)['light']
const PARTS: Part[] = ['columns', 'projections', 'primaryKey', 'skipIndexes']

type TableStorage = NonNullable<StrideLiteOpsMetrics['storageByTable']>[number]

const partsOf = (row: TableStorage): Record<Part, number> => ({
  columns: row.columns,
  projections: row.projections,
  primaryKey: row.primaryKey + row.marks,
  skipIndexes: row.skipIndexes,
})

const useSeriesColors = () => SERIES[useTheme().palette.mode === 'dark' ? 'dark' : 'light']

const Help = ({ children }: { children: string }) => (
  <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 820, mb: 1 }}>
    {children}
  </Typography>
)

const Swatch = ({ color }: { color: string }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '2px',
      bgcolor: color,
      mr: 0.75,
    }}
  />
)

const usePartLabels = (): Record<Part, string> => {
  const { t } = useTranslation()
  return {
    columns: t('strideLite.storage_columns'),
    projections: t('strideLite.storage_projections'),
    primaryKey: t('strideLite.storage_primary_key'),
    skipIndexes: t('strideLite.storage_skip_indexes'),
  }
}

/** The whole disk as one bar: what serves queries, by kind, then everything else, then free. */
const DiskBar = ({ data }: { data: StrideLiteOpsMetrics }) => {
  const { t } = useTranslation()
  const f = useFormats()
  const theme = useTheme()
  const colors = useSeriesColors()
  const labels = usePartLabels()
  const disk = data.disks?.[0]
  const tables = data.storageByTable
  if (!disk || !tables) return null

  const totals = PARTS.reduce(
    (acc, part) => ({ ...acc, [part]: tables.reduce((n, row) => n + partsOf(row)[part], 0) }),
    {} as Record<Part, number>,
  )
  const served = PARTS.reduce((n, part) => n + totals[part], 0)
  const used = disk.total - disk.free
  const segments = [
    ...PARTS.map((part) => ({
      key: part,
      label: labels[part],
      bytes: totals[part],
      color: colors[part],
    })),
    {
      key: 'other',
      label: t('strideLite.storage_other'),
      bytes: Math.max(0, used - served),
      color: theme.palette.text.disabled,
    },
    {
      key: 'free',
      label: t('strideLite.disk_free'),
      bytes: disk.free,
      color: theme.palette.action.selected,
    },
  ]

  return (
    <Box>
      <Box
        role="img"
        aria-label={segments.map((s) => `${s.label} ${f.bytes(s.bytes)}`).join(', ')}
        sx={{ display: 'flex', height: 28, gap: '2px', borderRadius: 1, overflow: 'hidden' }}>
        {segments
          .filter((s) => s.bytes > 0)
          .map((s) => (
            <Box
              key={s.key}
              title={`${s.label}: ${f.bytes(s.bytes)} (${f.percent(s.bytes / disk.total)})`}
              sx={{ flexGrow: s.bytes, flexBasis: 0, minWidth: 2, bgcolor: s.color }}
            />
          ))}
      </Box>
      <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 0.5, mt: 1 }}>
        {segments.map((s) => (
          <Typography key={s.key} variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            <Swatch color={s.color} />
            {s.label}: <strong>{f.bytes(s.bytes)}</strong> ({f.percent(s.bytes / disk.total)})
          </Typography>
        ))}
      </Stack>
      <Help>{t('strideLite.storage_other_help')}</Help>
    </Box>
  )
}

const TableTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: TableStorage }>
}) => {
  const { t } = useTranslation()
  const f = useFormats()
  const colors = useSeriesColors()
  const labels = usePartLabels()
  const row = active ? payload?.[0]?.payload : undefined
  if (!row) return null
  const parts = partsOf(row)
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
      <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
        {row.table}
      </Typography>
      {PARTS.map((part) => (
        <Typography key={part} variant="body2">
          <Swatch color={colors[part]} />
          {labels[part]}: {f.bytes(parts[part])}
        </Typography>
      ))}
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {t('strideLite.rows')}: {f.count(row.rows)} · {t('strideLite.bytes_per_row')}:{' '}
        {row.rows ? f.decimal(row.bytes / row.rows) : '—'}
      </Typography>
    </Box>
  )
}

const TablesChart = ({ tables }: { tables: TableStorage[] }) => {
  const f = useFormats()
  const colors = useSeriesColors()
  const labels = usePartLabels()
  const theme = useTheme()
  const rows = tables.slice(0, TABLES_CHARTED).map((row) => ({ ...row, ...partsOf(row) }))
  return (
    <Box dir="ltr">
      <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 2, mb: 1 }}>
        {PARTS.map((part) => (
          <Typography key={part} variant="body2">
            <Swatch color={colors[part]} />
            {labels[part]}
          </Typography>
        ))}
      </Stack>
      <ResponsiveContainer width="100%" height={rows.length * BAR_ROW_HEIGHT + 40}>
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }} barCategoryGap={6}>
          <XAxis
            type="number"
            tickFormatter={(n: number) => f.bytes(n)}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="table"
            width={190}
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12, fontFamily: 'monospace' }}
          />
          <Tooltip content={<TableTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          {PARTS.map((part, i) => (
            <Bar
              key={part}
              dataKey={part}
              stackId="bytes"
              fill={colors[part]}
              stroke={theme.palette.background.paper}
              strokeWidth={1}
              isAnimationActive={false}
              radius={i === PARTS.length - 1 ? [0, 4, 4, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

const NumberCell = ({ children }: { children: React.ReactNode }) => (
  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
    {children}
  </TableCell>
)

const Mono = ({ children }: { children: React.ReactNode }) => (
  <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{children}</TableCell>
)

const DataTable = ({ head, children }: { head: React.ReactNode; children: React.ReactNode }) => (
  <Box sx={{ overflowX: 'auto' }}>
    <Table size="small" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      <TableHead>
        <TableRow>{head}</TableRow>
      </TableHead>
      <TableBody>{children}</TableBody>
    </Table>
  </Box>
)

export const StorageSection = () => {
  const { t } = useTranslation()
  const f = useFormats()
  const { data, error, isLoading } = useQuery(strideLiteOpsMetricsQueryOptions())

  if (error) return <Unreachable error={error} />
  if (isLoading || !data) return <SkeletonLoader />
  if (!data.storageByTable) {
    return (
      <Box>
        <Help>{t('strideLite.storage_unavailable')}</Help>
        {data.tables && (
          <DataTable
            head={
              <>
                <TableCell>{t('strideLite.table')}</TableCell>
                <TableCell align="right">{t('strideLite.rows')}</TableCell>
                <TableCell align="right">{t('strideLite.size_on_disk')}</TableCell>
              </>
            }>
            {data.tables.map((row) => (
              <TableRow key={row.table}>
                <Mono>{row.table}</Mono>
                <NumberCell>{f.count(row.rows)}</NumberCell>
                <NumberCell>{f.bytes(row.bytes)}</NumberCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </Box>
    )
  }

  const tables = data.storageByTable
  const rowsByTable = new Map(tables.map((row) => [row.table, row.rows]))
  const bytesByTable = new Map(tables.map((row) => [row.table, row.bytes]))

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="subtitle1">{t('strideLite.storage_disk')}</Typography>
        <Help>{t('strideLite.storage_disk_help')}</Help>
        <DiskBar data={data} />
      </Box>

      <Box>
        <Typography variant="subtitle1">{t('strideLite.storage_by_table')}</Typography>
        <Help>{t('strideLite.storage_by_table_help')}</Help>
        <TablesChart tables={tables} />
        <DataTable
          head={
            <>
              <TableCell>{t('strideLite.table')}</TableCell>
              <TableCell align="right">{t('strideLite.rows')}</TableCell>
              <TableCell align="right">{t('strideLite.parts')}</TableCell>
              <TableCell align="right">{t('strideLite.size_on_disk')}</TableCell>
              <TableCell align="right">{t('strideLite.storage_columns')}</TableCell>
              <TableCell align="right">{t('strideLite.storage_projections')}</TableCell>
              <TableCell align="right">{t('strideLite.storage_primary_key')}</TableCell>
              <TableCell align="right">{t('strideLite.storage_skip_indexes')}</TableCell>
              <TableCell align="right">{t('strideLite.compression')}</TableCell>
              <TableCell align="right">{t('strideLite.bytes_per_row')}</TableCell>
            </>
          }>
          {tables.map((row) => (
            <TableRow key={row.table}>
              <Mono>{row.table}</Mono>
              <NumberCell>{f.count(row.rows)}</NumberCell>
              <NumberCell>{f.count(row.parts)}</NumberCell>
              <NumberCell>{f.bytes(row.bytes)}</NumberCell>
              <NumberCell>{f.bytes(row.columns)}</NumberCell>
              <NumberCell>{f.bytes(row.projections)}</NumberCell>
              <NumberCell>{f.bytes(row.primaryKey + row.marks)}</NumberCell>
              <NumberCell>{f.bytes(row.skipIndexes)}</NumberCell>
              <NumberCell>
                {row.columns ? f.ratio(row.columnsUncompressed / row.columns) : '—'}
              </NumberCell>
              <NumberCell>{row.rows ? f.decimal(row.bytes / row.rows) : '—'}</NumberCell>
            </TableRow>
          ))}
        </DataTable>
      </Box>

      {data.projections && data.projections.length > 0 && (
        <Box>
          <Typography variant="subtitle1">{t('strideLite.storage_projections')}</Typography>
          <Help>{t('strideLite.projections_help')}</Help>
          <DataTable
            head={
              <>
                <TableCell>{t('strideLite.projection')}</TableCell>
                <TableCell align="right">{t('strideLite.rows')}</TableCell>
                <TableCell align="right">{t('strideLite.size_on_disk')}</TableCell>
                <TableCell align="right">{t('strideLite.share_of_table')}</TableCell>
              </>
            }>
            {data.projections.map((p) => {
              const tableBytes = bytesByTable.get(p.table)
              return (
                <TableRow key={`${p.table}.${p.projection}`}>
                  <Mono>{`${p.table}.${p.projection}`}</Mono>
                  <NumberCell>{f.count(p.rows)}</NumberCell>
                  <NumberCell>{f.bytes(p.bytes)}</NumberCell>
                  <NumberCell>{tableBytes ? f.percent(p.bytes / tableBytes) : '—'}</NumberCell>
                </TableRow>
              )
            })}
          </DataTable>
        </Box>
      )}

      {data.skipIndexes && (
        <Box>
          <Typography variant="subtitle1">{t('strideLite.storage_skip_indexes')}</Typography>
          <Help>{t('strideLite.skip_indexes_help')}</Help>
          {data.skipIndexes.length === 0 ? (
            <Help>{t('strideLite.none')}</Help>
          ) : (
            <DataTable
              head={
                <>
                  <TableCell>{t('strideLite.index')}</TableCell>
                  <TableCell>{t('strideLite.index_type')}</TableCell>
                  <TableCell>{t('strideLite.index_expression')}</TableCell>
                  <TableCell align="right">{t('strideLite.granularity')}</TableCell>
                  <TableCell align="right">{t('strideLite.size_on_disk')}</TableCell>
                </>
              }>
              {data.skipIndexes.map((ix) => (
                <TableRow key={`${ix.table}.${ix.name}`}>
                  <Mono>{`${ix.table}.${ix.name}`}</Mono>
                  <Mono>{ix.type}</Mono>
                  <Mono>{ix.expr}</Mono>
                  <NumberCell>{f.count(ix.granularity)}</NumberCell>
                  <NumberCell>{f.bytes(ix.bytes)}</NumberCell>
                </TableRow>
              ))}
            </DataTable>
          )}
        </Box>
      )}

      {data.columns && (
        <Box>
          <Typography variant="subtitle1">{t('strideLite.largest_columns')}</Typography>
          <Help>{t('strideLite.columns_help')}</Help>
          <DataTable
            head={
              <>
                <TableCell>{t('strideLite.column')}</TableCell>
                <TableCell>{t('strideLite.column_type')}</TableCell>
                <TableCell>{t('strideLite.codec')}</TableCell>
                <TableCell align="right">{t('strideLite.size_on_disk')}</TableCell>
                <TableCell align="right">{t('strideLite.compression')}</TableCell>
                <TableCell align="right">{t('strideLite.bytes_per_row')}</TableCell>
              </>
            }>
            {data.columns.map((c) => {
              const rows = rowsByTable.get(c.table)
              return (
                <TableRow key={`${c.table}.${c.column}`}>
                  <Mono>{`${c.table}.${c.column}`}</Mono>
                  <Mono>{c.type}</Mono>
                  <Mono>{c.codec || t('strideLite.codec_default')}</Mono>
                  <NumberCell>{f.bytes(c.compressed)}</NumberCell>
                  <NumberCell>
                    {c.compressed ? f.ratio(c.uncompressed / c.compressed) : '—'}
                  </NumberCell>
                  <NumberCell>{rows ? f.decimal(c.compressed / rows) : '—'}</NumberCell>
                </TableRow>
              )
            })}
          </DataTable>
        </Box>
      )}

      {data.storageNotServed && data.storageNotServed.length > 0 && (
        <Box>
          <Typography variant="subtitle1">{t('strideLite.not_served')}</Typography>
          <Help>{t('strideLite.not_served_help')}</Help>
          <DataTable
            head={
              <>
                <TableCell>{t('strideLite.kind')}</TableCell>
                <TableCell>{t('strideLite.table')}</TableCell>
                <TableCell align="right">{t('strideLite.parts')}</TableCell>
                <TableCell align="right">{t('strideLite.size_on_disk')}</TableCell>
              </>
            }>
            {data.storageNotServed.map((row) => (
              <TableRow key={`${row.kind}.${row.table}`}>
                <TableCell>{row.kind}</TableCell>
                <Mono>{row.table}</Mono>
                <NumberCell>{f.count(row.parts)}</NumberCell>
                <NumberCell>{f.bytes(row.bytes)}</NumberCell>
              </TableRow>
            ))}
          </DataTable>
        </Box>
      )}
    </Stack>
  )
}

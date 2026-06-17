import {
  Box,
  Link as MuiLink,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { VehicleRideRow } from './buildVehicleRideRows'

interface VehicleTableProps {
  rows: VehicleRideRow[]
  /** Applied when a linkable ride's time is clicked, before navigating to single-line-map. */
  onRowClick: (payload: VehicleRideRow['setSearchPayload']) => void
}

/** The ride time — a link to single-line-map when the ride is resolvable, plain text
 *  otherwise. Shared by both the table and the card layout. */
function RideTime({
  row,
  onRowClick,
}: {
  row: VehicleRideRow
  onRowClick: VehicleTableProps['onRowClick']
}) {
  if (!row.href) return <>{row.displayTime}</>
  return (
    <MuiLink
      component={Link}
      to={row.href}
      underline="hover"
      // a deeper blue + medium weight so the linked time reads as clickable
      sx={{ color: 'primary.dark', fontWeight: 500 }}
      onClick={() => onRowClick(row.setSearchPayload)}>
      {row.displayTime}
    </MuiLink>
  )
}

/** Wide-screen layout: one row per ride, operator last (least important column). */
export function VehicleRidesTable({ rows, onRowClick }: VehicleTableProps) {
  const { t } = useTranslation()
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small" aria-label={t('vehicle_page_title')}>
        <TableHead>
          <TableRow>
            <TableCell>{t('line')}</TableCell>
            <TableCell>{t('vehicle_rides_start_time')}</TableCell>
            <TableCell>{t('operator.origin')}</TableCell>
            <TableCell>{t('operator.destination')}</TableCell>
            <TableCell>{t('operator_title')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell sx={{ fontWeight: 600 }}>{row.lineNumber}</TableCell>
              <TableCell>
                <RideTime row={row} onRowClick={onRowClick} />
              </TableCell>
              <TableCell>{row.origin}</TableCell>
              <TableCell>{row.destination}</TableCell>
              <TableCell>{row.operator}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

/** Narrow-screen layout: the table doesn't fit, so each ride becomes a stacked card —
 *  line + time on top, then origin, destination and operator in a small label/value
 *  table (gray labels, normal values). <bdi> isolates each value so a Latin name can't
 *  reorder the surrounding RTL label. */
export function VehicleRidesCards({ rows, onRowClick }: VehicleTableProps) {
  const { t } = useTranslation()
  return (
    <Stack spacing={1} sx={{ mt: 2 }} aria-label={t('vehicle_page_title')}>
      {rows.map((row) => (
        <Paper key={row.id} variant="outlined" sx={{ p: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 1,
            }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('line')} {row.lineNumber}
            </Typography>
            <Typography variant="subtitle1">
              <RideTime row={row} onRowClick={onRowClick} />
            </Typography>
          </Box>
          <Table size="small" sx={{ width: 'auto' }}>
            <TableBody>
              {[
                { label: t('operator.origin'), value: row.origin },
                { label: t('operator.destination'), value: row.destination },
                { label: t('operator_title'), value: row.operator },
              ].map((field) => (
                <TableRow key={field.label}>
                  <TableCell
                    sx={{
                      border: 0,
                      p: 0,
                      pb: 0.5,
                      paddingInlineEnd: '0.75rem',
                      color: 'text.secondary',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}>
                    {field.label}
                  </TableCell>
                  <TableCell sx={{ border: 0, p: 0, pb: 0.5 }}>
                    <bdi>{field.value}</bdi>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
    </Stack>
  )
}

/** A vehicle's rides for the day. Renders as a table on wider screens and as a stacked
 *  card list on narrow ones (the table is too wide for phones). All data is pre-resolved
 *  by buildVehicleRideRows; these components only render it. */
export function VehicleTable(props: VehicleTableProps) {
  const theme = useTheme()
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'))
  return isNarrow ? <VehicleRidesCards {...props} /> : <VehicleRidesTable {...props} />
}

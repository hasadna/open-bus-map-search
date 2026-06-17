import {
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { VehicleRideRow } from './buildVehicleRideRows'

interface VehicleTableProps {
  rows: VehicleRideRow[]
  /** Applied when a linkable ride's time is clicked, before navigating to single-line-map. */
  onRowClick: (payload: VehicleRideRow['setSearchPayload']) => void
}

/** Presentational table of a vehicle's rides for the day. All data is pre-resolved
 *  by buildVehicleRideRows; this component only renders it (and is isolated so the
 *  resolved/dashes/past-midnight row variants can be pinned in Storybook). */
export function VehicleTable({ rows, onRowClick }: VehicleTableProps) {
  const { t } = useTranslation()
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small" aria-label={t('vehicle_page_title')}>
        <TableHead>
          <TableRow>
            <TableCell>{t('line')}</TableCell>
            <TableCell>{t('operator.origin')}</TableCell>
            <TableCell>{t('operator.destination')}</TableCell>
            <TableCell>{t('vehicle_rides_start_time')}</TableCell>
            <TableCell>{t('operator_title')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.lineNumber}</TableCell>
              <TableCell>{row.origin}</TableCell>
              <TableCell>{row.destination}</TableCell>
              <TableCell>
                {row.href ? (
                  <MuiLink
                    component={Link}
                    to={row.href}
                    underline="hover"
                    onClick={() => onRowClick(row.setSearchPayload)}>
                    {row.displayTime}
                  </MuiLink>
                ) : (
                  row.displayTime
                )}
              </TableCell>
              <TableCell>{row.operator}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { PositionGroup } from 'src/pages/components/map-related/map-types'
import Widget from 'src/shared/Widget'
import { vehicleIDFormat } from '../components/utils/rotueUtils'

const MISSING_DATA_SIGN = '-'

export const LineProfileRide = ({ positionGroups }: { positionGroups: PositionGroup[] }) => {
  const { t } = useTranslation()

  return (
    <Widget>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ '& .MuiTableCell-root': { pt: 0 } }}>
            <TableRow>
              <TableCell>{t('lineProfile.ride.journey')}</TableCell>
              <TableCell>{t('lineProfile.ride.id')}</TableCell>
              <TableCell>{t('vehicle_ref')}</TableCell>
              <TableCell>{t('lineProfile.ride.duration')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positionGroups.map((group, index) => {
              const point = group.positions[0]?.point
              const plate = vehicleIDFormat(group.vehicleRef ?? point?.siriRideVehicleRef)

              return (
                <TableRow key={point?.siriRideId ?? index}>
                  <TableCell>{point?.siriRideJourneyRef ?? MISSING_DATA_SIGN}</TableCell>
                  <TableCell>{point?.siriRideId?.toString() ?? MISSING_DATA_SIGN}</TableCell>
                  <TableCell>{plate ?? MISSING_DATA_SIGN}</TableCell>
                  <TableCell>
                    {point?.siriRideDurationMinutes
                      ? `${point.siriRideDurationMinutes} ${t('minutes')}`
                      : MISSING_DATA_SIGN}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Widget>
  )
}

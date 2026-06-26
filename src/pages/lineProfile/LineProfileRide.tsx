import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { PositionGroup } from 'src/pages/components/map-related/map-types'
import Widget from 'src/shared/Widget'
import { vehicleIDFormat } from '../components/utils/rotueUtils'

export const LineProfileRide = ({ positionGroups }: { positionGroups: PositionGroup[] }) => {
  const { t } = useTranslation()

  return (
    <Widget>
      <TableContainer>
        <Table size="small">
          <TableHead>
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
              const plate =
                group.label ?? vehicleIDFormat(group.vehicleRef ?? point?.siriRideVehicleRef)

              return (
                <TableRow key={point?.siriRideId ?? index}>
                  <TableCell>{point?.siriRideJourneyRef ?? '-'}</TableCell>
                  <TableCell>{point?.siriRideId?.toString() ?? '-'}</TableCell>
                  <TableCell>{plate ?? '-'}</TableCell>
                  <TableCell>
                    {point?.siriRideDurationMinutes
                      ? `${point.siriRideDurationMinutes} ${t('minutes')}`
                      : '-'}
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

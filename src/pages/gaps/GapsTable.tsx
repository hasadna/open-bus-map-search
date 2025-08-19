import {
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { Skeleton } from 'antd'
import React, { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DisplayGapsPercentage from '../components/DisplayGapsPercentage'
import { Row } from '../components/Row'
import Widget from 'src/shared/Widget'
import { Gap } from 'src/api/gapsService'
import dayjs from 'src/dayjs'

interface GapsTableProps {
  gaps?: Gap[]
  loading?: boolean
  initOnlyGapped?: boolean
}

const cellStyle = {
  padding: '6px',
  textAlign: 'center',
  border: '1px solid rgba(128, 128, 128, 0.2) !important',
} as const

const colors = {
  ride_as_planned: 'rgba(0, 255, 0, 0.15)',
  ride_missing: 'rgba(255, 0, 0, 0.15)',
  ride_duped: 'rgba(0, 255, 255, 0.15)',
  ride_extra: 'rgba(255, 255, 0, 0.15)',
  ride_in_future: 'rgba(0, 0, 255, 0.15)',
} as const

const formatStatus = (gap: Gap, gaps: Gap[] | undefined): keyof typeof colors => {
  const currentTime = dayjs()
  if (gap.plannedStartTime?.isAfter(currentTime) && !gap.actualStartTime) return 'ride_in_future'
  if (!gap.actualStartTime && gap.plannedStartTime?.isBefore(currentTime)) return 'ride_missing'
  if (gap.plannedStartTime?.isSame(gap.actualStartTime)) return 'ride_as_planned'
  const hasTwinRide = gaps?.some(
    (g) =>
      g.plannedStartTime &&
      g.actualStartTime &&
      gap.actualStartTime &&
      g.actualStartTime.isSame(gap.actualStartTime),
  )
  return hasTwinRide ? 'ride_duped' : 'ride_extra'
}

const GapsTable: React.FC<GapsTableProps> = ({ gaps, loading, initOnlyGapped = false }) => {
  const { t } = useTranslation()
  const [onlyGapped, setOnlyGapped] = useState(initOnlyGapped)

  const filteredGaps: Gap[] = useMemo(() => {
    if (!gaps) return []
    return gaps
      .filter((gap) =>
        onlyGapped
          ? !gap.actualStartTime && gap.plannedStartTime?.isBefore(dayjs())
          : gap.plannedStartTime || gap.actualStartTime,
      )
      .sort((a, b) =>
        (a?.actualStartTime || a?.plannedStartTime)?.diff(
          b?.actualStartTime || b?.plannedStartTime,
        ),
      )
  }, [gaps, onlyGapped])

  const groupedGaps = useMemo(() => {
    const map: Record<string, { gap: Gap; status: keyof typeof colors }[]> = {}
    for (const gap of filteredGaps) {
      const hour = gap.plannedStartTime?.get('hour') ?? gap.actualStartTime?.get('hour')
      if (hour === undefined) continue
      const status = formatStatus(gap, filteredGaps)
      if (!map[hour]) map[hour] = []
      map[hour].push({ gap, status })
    }
    return map
  }, [filteredGaps])

  const gapsPercentage = useMemo(() => {
    const relevant = Object.values(groupedGaps)
      .flat()
      .filter(({ status }) => status === 'ride_as_planned' || status === 'ride_missing')
    if (!relevant.length) return
    const missing = relevant.filter(({ status }) => status === 'ride_missing')
    return (missing.length / relevant.length) * 100
  }, [groupedGaps])

  return (
    <Widget marginBottom sx={{ overflowY: 'none', maxWidth: '600px' }}>
      <Row style={{ justifyContent: 'space-between', fontWeight: 500 }}>
        <FormControlLabel
          control={
            <Switch checked={onlyGapped} onChange={(e) => setOnlyGapped(e.target.checked)} />
          }
          label={t('checkbox_only_gaps')}
        />
        <DisplayGapsPercentage
          gapsPercentage={gapsPercentage}
          decentPercentage={5}
          terriblePercentage={20}
        />
      </Row>

      <TableContainer>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} title={false} style={{ minWidth: '100%' }} />
        ) : (
          <Table sx={{ maxWidth: 'fit-content' }}>
            <TableBody>
              {Object.keys(groupedGaps)
                .sort((a, b) => (a === '0' ? 1 : b === '0' ? -1 : Number(a) - Number(b)))
                .map((hour) => (
                  <TableRow key={hour}>
                    {groupedGaps[hour].map(({ gap, status }, j) => {
                      const time = (gap.plannedStartTime || gap.actualStartTime)?.format('HH:mm')
                      return (
                        <TableCell
                          key={`${hour}-${j}-${time}`}
                          sx={{ ...cellStyle, background: colors[status] }}>
                          {time}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Legend */}
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell />
            </TableRow>
            <TableRow>
              <TableCell sx={{ ...cellStyle, background: colors.ride_as_planned }}>
                {t('ride_as_planned')}
              </TableCell>
              <TableCell sx={{ ...cellStyle, background: colors.ride_missing }}>
                {t('ride_missing')}
              </TableCell>
              <TableCell sx={{ ...cellStyle, background: colors.ride_extra }}>
                {t('ride_extra')}
              </TableCell>
              <TableCell sx={{ ...cellStyle, background: colors.ride_duped }}>
                {t('ride_duped')}
              </TableCell>
              <TableCell sx={{ ...cellStyle, background: colors.ride_in_future }}>
                {t('ride_in_future')}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Widget>
  )
}

export default memo(GapsTable)

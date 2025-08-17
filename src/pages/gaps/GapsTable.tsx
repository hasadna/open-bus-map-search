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
import React, { memo, useCallback, useMemo, useState } from 'react'
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

function groupByHours(gaps: Gap[]) {
  const hours: Record<string, typeof gaps> = {}
  for (const gap of gaps) {
    const hour = gap.plannedStartTime?.get('hour') ?? gap.actualStartTime?.get('hour')
    if (hour == null) continue
    if (!hours[hour]) hours[hour] = []
    hours[hour].push(gap)
  }
  return hours
}

const GapsTable: React.FC<GapsTableProps> = ({ gaps, loading, initOnlyGapped = false }) => {
  const { t, i18n } = useTranslation()
  const [onlyGapped, setOnlyGapped] = useState(initOnlyGapped)

  const formatStatus = useCallback(
    (gap: Gap, gaps: Gap[] | undefined): string => {
      const currentTime = dayjs()
      // case: planned in future and no actual
      if (gap.plannedStartTime?.isAfter(currentTime) && !gap.actualStartTime) {
        return t('ride_in_future')
      }
      // case: missing
      if (!gap.actualStartTime && gap.plannedStartTime?.isBefore(currentTime)) {
        return t('ride_missing')
      }
      // case: both exist = planned
      if (gap.plannedStartTime?.isSame(gap.actualStartTime)) {
        return t('ride_as_planned')
      }
      // case: extra / duped
      const hasTwinRide = gaps?.some(
        (g) =>
          g.plannedStartTime &&
          g.actualStartTime &&
          gap.actualStartTime &&
          g.actualStartTime.isSame(gap.actualStartTime),
      )

      return hasTwinRide ? t('ride_duped') : t('ride_extra')
    },
    [t, i18n.language],
  )

  const getGapsPercentage = useCallback(
    (gaps: Gap[] | undefined): number | undefined => {
      if (!gaps || gaps.length === 0) return
      const statusAsPlanned = t('ride_as_planned')
      const statusMissing = t('ride_missing')
      let relevant = 0
      let missing = 0
      for (const gap of gaps) {
        const status = formatStatus(gap, gaps)
        if (status === statusAsPlanned || status === statusMissing) {
          relevant++
          if (status === statusMissing) missing++
        }
      }
      if (relevant === 0) return
      return (missing / relevant) * 100
    },
    [formatStatus],
  )

  const gapsPercentage = useMemo(() => getGapsPercentage(gaps), [gaps, t])

  const filteredGaps = useMemo(() => {
    if (!gaps) return []
    return gaps
      .filter((gap) => {
        return onlyGapped
          ? !gap.actualStartTime && gap.plannedStartTime?.isBefore(dayjs())
          : gap.plannedStartTime || gap.actualStartTime
      })
      .sort((a, b) =>
        Number(
          (a?.actualStartTime || a?.plannedStartTime)?.diff(
            b?.actualStartTime || b?.plannedStartTime,
          ),
        ),
      )
  }, [gaps, onlyGapped])

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
              <TableRow>
                <TableCell />
              </TableRow>

              {Object.values(groupByHours(filteredGaps)).map((gaps, i) => (
                <TableRow key={i}>
                  {gaps.map((gap, j) => {
                    const time = (gap.plannedStartTime || gap.actualStartTime)?.format('HH:mm')
                    const status = formatStatus(gap, gaps)
                    return (
                      <TableCell
                        sx={{
                          ...cellStyle,
                          background:
                            status === t('ride_as_planned')
                              ? colors.ride_as_planned
                              : status === t('ride_missing')
                                ? colors.ride_missing
                                : status === t('ride_duped')
                                  ? colors.ride_duped
                                  : status === t('ride_extra')
                                    ? colors.ride_extra
                                    : colors.ride_in_future,
                        }}
                        key={`${i}-${j}-${time}`}>
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

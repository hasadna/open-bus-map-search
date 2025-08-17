import { RideExecutionPydanticModel } from '@hasadna/open-bus-api-client'
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

interface GapsTableProps {
  gaps?: RideExecutionPydanticModel[]
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

// ---- Helpers using native Date ----
function formatTime(time?: Date) {
  if (!time) return
  return time.toLocaleTimeString('he', { hour: '2-digit', minute: '2-digit' })
}

function isAfter(d1?: Date, d2: Date = new Date()) {
  return !!d1 && d1.getTime() > d2.getTime()
}

function isBefore(d1?: Date, d2: Date = new Date()) {
  return !!d1 && d1.getTime() < d2.getTime()
}

function isSame(d1?: Date, d2?: Date) {
  return !!d1 && !!d2 && d1.getTime() === d2.getTime()
}

function diff(d1?: Date, d2?: Date) {
  if (!d1 || !d2) return 0
  return d1.getTime() - d2.getTime()
}

function groupByHours(gaps: RideExecutionPydanticModel[]) {
  const hours: Record<string, typeof gaps> = {}
  for (const gap of gaps) {
    const hour = gap.plannedStartTime?.getHours() ?? gap.actualStartTime?.getHours()
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
    (gap: RideExecutionPydanticModel, all: RideExecutionPydanticModel[] | undefined): string => {
      // case: planned in future and no actual
      if (isAfter(gap.plannedStartTime) && !gap.actualStartTime) {
        return t('ride_in_future')
      }
      // case: missing
      if (!gap.actualStartTime && isBefore(gap.plannedStartTime)) {
        return t('ride_missing')
      }
      // case: both exist = planned
      if (isSame(gap.plannedStartTime, gap.actualStartTime)) {
        return t('ride_as_planned')
      }
      // case: extra / duped
      const hasTwinRide = all?.some(
        (g) =>
          g !== gap &&
          g.actualStartTime &&
          gap.actualStartTime &&
          isSame(g.actualStartTime, gap.actualStartTime),
      )

      return hasTwinRide ? t('ride_duped') : t('ride_extra')
    },
    [t, i18n.language],
  )

  const getGapsPercentage = useCallback(
    (gaps: RideExecutionPydanticModel[] | undefined): number | undefined => {
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
          ? !gap.actualStartTime && isBefore(gap.plannedStartTime)
          : gap.plannedStartTime || gap.actualStartTime
      })
      .sort((a, b) =>
        diff(a?.actualStartTime || a?.plannedStartTime, b?.actualStartTime || b?.plannedStartTime),
      )
  }, [gaps, onlyGapped])

  return (
    <TableContainer
      component={Widget}
      marginBottom
      sx={{ minWidth: '600px', width: 'fit-content' }}>
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
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} title={false} style={{ minWidth: '100%' }} />
      ) : (
        <Table sx={{ width: 'fit-content' }}>
          <TableBody>
            {Object.values(groupByHours(filteredGaps)).map((gaps, i) => (
              <TableRow key={i}>
                {gaps.map((gap, j) => {
                  const time = formatTime(gap.plannedStartTime || gap.actualStartTime)
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
            <TableRow>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      )}
      <Table sx={{ marginTop: '0px' }}>
        <TableBody>
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
  )
}

export default memo(GapsTable)

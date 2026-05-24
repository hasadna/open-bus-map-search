import {
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from '@mui/material'
import { Skeleton } from 'antd'
import React, { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Gap } from 'src/api/gapsService'
import dayjs, { toIsraelTimezone } from 'src/dayjs'
import { formatStartTimeForQuery } from 'src/pages/components/utils/startTimeUtils'
import Widget from 'src/shared/Widget'
import DisplayGapsPercentage from '../components/DisplayGapsPercentage'
import { Row } from '../components/Row'

interface GapsTableProps {
  gaps?: Gap[]
  loading?: boolean
  initOnlyGapped?: boolean
  singleLineMapBaseHref: string
  date: number
  onStartTimeClick?: (rideTime: string) => void
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

const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm'

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

function buildTooltip(gap: Gap): React.ReactNode {
  const planned = gap.plannedStartTime?.format(DATE_TIME_FORMAT)
  const actual = gap.actualStartTime?.format(DATE_TIME_FORMAT)
  const diffMin =
    gap.actualStartTime && gap.plannedStartTime
      ? gap.actualStartTime.diff(gap.plannedStartTime, 'minute')
      : null
  return (
    <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
      <div>planned: {planned ?? '—'}</div>
      <div>actual: {actual ?? '—'}</div>
      {diffMin !== null && diffMin !== 0 && (
        <div>({diffMin > 0 ? `+${diffMin}` : diffMin} min)</div>
      )}
    </div>
  )
}
const getGap = (gap: Gap) => gap.plannedStartTime || gap.actualStartTime

const GapsTable: React.FC<GapsTableProps> = ({
  gaps,
  loading,
  initOnlyGapped = false,
  singleLineMapBaseHref,
  date,
  onStartTimeClick,
}) => {
  const { t } = useTranslation()
  const serviceDayStart = toIsraelTimezone(date).startOf('day')
  const [onlyGapped, setOnlyGapped] = useState(initOnlyGapped)

  const filteredGaps: Gap[] = useMemo(() => {
    if (!gaps) return []
    return gaps
      .filter((gap) =>
        onlyGapped ? !gap.actualStartTime && gap.plannedStartTime?.isBefore(dayjs()) : getGap(gap),
      )
      .sort((a, b) => getGap(a)?.diff(getGap(b)) ?? 0)
  }, [gaps, onlyGapped])

  const groupedGaps = useMemo(() => {
    const map: Record<string, { gap: Gap; status: keyof typeof colors }[]> = {}
    for (const gap of filteredGaps) {
      const hour = getGap(gap)?.startOf('hour').valueOf()
      if (hour === undefined) continue
      const status = formatStatus(gap, filteredGaps)
      if (!map[hour]) map[hour] = []
      map[hour].push({ gap, status })
    }
    return map
  }, [filteredGaps])

  const gapsPercentage = useMemo(() => {
    if (!gaps) return
    const relevant = gaps
      .filter(getGap)
      .map((gap) => ({ gap, status: formatStatus(gap, gaps) }))
      .filter(({ status }) => status === 'ride_as_planned' || status === 'ride_missing')
    if (!relevant.length) return
    const missing = relevant.filter(({ status }) => status === 'ride_missing')
    return (missing.length / relevant.length) * 100
  }, [gaps])

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
                .sort((a, b) => Number(a) - Number(b))
                .map((hour) => (
                  <TableRow key={hour}>
                    {groupedGaps[hour].map(({ gap, status }, j) => {
                      const gapTime = gap.plannedStartTime || gap.actualStartTime
                      const displayTime = gapTime?.format('HH:mm')
                      const rideToken = (() => {
                        if (!gapTime) return undefined
                        const totalMinutes = gapTime.diff(serviceDayStart, 'minutes')
                        const h = Math.floor(totalMinutes / 60)
                        const m = totalMinutes % 60
                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                      })()
                      const hasRide = Boolean(gap.actualStartTime)
                      const startTimeParam = formatStartTimeForQuery(rideToken)
                      const cellHref = `${singleLineMapBaseHref}&rideTime=${startTimeParam}`
                      return (
                        <Tooltip
                          key={`${hour}-${j}-${displayTime}`}
                          title={buildTooltip(gap)}
                          arrow>
                          <TableCell
                            sx={{
                              ...cellStyle,
                              background: colors[status],
                              cursor: hasRide ? 'pointer' : 'default',
                              '& a, & a:visited, & a:hover, & a:focus': {
                                color: 'inherit',
                                textDecoration: 'underline',
                              },
                            }}>
                            {hasRide ? (
                              <Link
                                to={cellHref}
                                onClick={() =>
                                  gap.actualStartTime && onStartTimeClick?.(startTimeParam)
                                }>
                                {displayTime}
                              </Link>
                            ) : (
                              displayTime
                            )}
                          </TableCell>
                        </Tooltip>
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

import {
  Box,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from '@mui/material'
import type { TFunction } from 'i18next'
import React, { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Gap } from 'src/api/gapsService'
import {
  formatInstant,
  formatTimeOfDay,
  getServiceDayTimeBounds,
  nowInstant,
  parseInstant,
} from 'src/dayjs'
import {
  formatServiceDayTime,
  formatStartTimeForQuery,
} from 'src/pages/components/utils/startTimeUtils'
import SkeletonLoader from 'src/shared/SkeletonLoader'
import Widget from 'src/shared/Widget'
import DisplayGapsPercentage from '../components/DisplayGapsPercentage'
import { Row } from '../components/Row'

interface GapsTableProps {
  gaps?: Gap[]
  loading?: boolean
  initOnlyGapped?: boolean
  singleLineMapBaseHref: string
  date: string
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
  const currentTime = nowInstant()
  const planned = parseInstant(gap.plannedStartTime)
  const actual = parseInstant(gap.actualStartTime)
  if (planned?.isAfter(currentTime) && !actual) return 'ride_in_future'
  if (!actual && planned?.isBefore(currentTime)) return 'ride_missing'
  if (planned?.isSame(actual)) return 'ride_as_planned'
  const hasTwinRide = gaps?.some((g) => {
    const gActual = parseInstant(g.actualStartTime)
    return Boolean(g.plannedStartTime && gActual && actual && gActual.isSame(actual))
  })
  return hasTwinRide ? 'ride_duped' : 'ride_extra'
}

function buildTooltip(gap: Gap, t: TFunction): React.ReactNode {
  const planned = gap.plannedStartTime
    ? formatInstant(gap.plannedStartTime, DATE_TIME_FORMAT)
    : undefined
  const actual = gap.actualStartTime
    ? formatInstant(gap.actualStartTime, DATE_TIME_FORMAT)
    : undefined
  const plannedInstant = parseInstant(gap.plannedStartTime)
  const actualInstant = parseInstant(gap.actualStartTime)
  const diffMin =
    actualInstant && plannedInstant ? actualInstant.diff(plannedInstant, 'minute') : null
  return (
    <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
      <div>
        {t('gap_tooltip_planned')}: {planned ?? '—'}
      </div>
      <div>
        {t('gap_tooltip_actual')}: {actual ?? '—'}
      </div>
      {diffMin !== null && diffMin !== 0 && (
        <div>{t('gap_tooltip_diff_minutes', { diff: diffMin > 0 ? `+${diffMin}` : diffMin })}</div>
      )}
    </div>
  )
}
const getGap = (gap: Gap) => gap.plannedStartTime || gap.actualStartTime
const getGapInstant = (gap: Gap) => parseInstant(getGap(gap))

const GapsTable: React.FC<GapsTableProps> = ({
  gaps,
  loading,
  initOnlyGapped = false,
  singleLineMapBaseHref,
  date,
  onStartTimeClick,
}) => {
  const { t } = useTranslation()
  const { start: serviceDayStart } = getServiceDayTimeBounds(date)
  const [onlyGapped, setOnlyGapped] = useState(initOnlyGapped)

  const filteredGaps: Gap[] = useMemo(() => {
    if (!gaps) return []
    return gaps
      .filter((gap) =>
        onlyGapped
          ? !gap.actualStartTime &&
            Boolean(parseInstant(gap.plannedStartTime)?.isBefore(nowInstant()))
          : getGap(gap),
      )
      .sort((a, b) => {
        const da = getGapInstant(a)
        const db = getGapInstant(b)
        return da && db ? da.diff(db) : 0
      })
  }, [gaps, onlyGapped])

  const groupedGaps = useMemo(() => {
    const map: Record<string, { gap: Gap; status: keyof typeof colors }[]> = {}
    for (const gap of filteredGaps) {
      const hour = getGapInstant(gap)?.startOf('hour').valueOf()
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
          <SkeletonLoader active title={false} rows={8} style={{ minWidth: '100%' }} />
        ) : (
          <Table sx={{ maxWidth: 'fit-content' }}>
            <TableBody>
              {Object.keys(groupedGaps)
                .sort((a, b) => Number(a) - Number(b))
                .map((hour) => {
                  // Every cell in an hour-row shares the same calendar day, so the
                  // "next night" marker lives once in a leading column for the whole row
                  // rather than on each time cell.
                  const rowGapTime = parseInstant(
                    groupedGaps[hour][0]?.gap.plannedStartTime ||
                      groupedGaps[hour][0]?.gap.actualStartTime,
                  )
                  const rowIsNextDay = rowGapTime
                    ? !rowGapTime.isSame(serviceDayStart, 'day')
                    : false
                  return (
                    <TableRow key={hour}>
                      <TableCell
                        sx={{ ...cellStyle, padding: '0 4px', width: '1em', border: 'none' }}>
                        {rowIsNextDay && (
                          <Box
                            component="span"
                            role="img"
                            aria-label={t('after_midnight_indicator')}>
                            🌙
                          </Box>
                        )}
                      </TableCell>
                      {groupedGaps[hour].map(({ gap, status }, j) => {
                        const gapTime = gap.plannedStartTime || gap.actualStartTime
                        const gapInstant = parseInstant(gapTime)
                        const displayTime = gapTime ? formatTimeOfDay(gapTime) : undefined
                        const rideToken = gapInstant
                          ? formatServiceDayTime(gapInstant, serviceDayStart)
                          : undefined
                        const hasRide = Boolean(gap.actualStartTime)
                        const startTimeParam = formatStartTimeForQuery(rideToken)
                        const cellHref = `${singleLineMapBaseHref}&rideTime=${startTimeParam}`
                        return (
                          <Tooltip
                            key={`${hour}-${j}-${displayTime}`}
                            title={buildTooltip(gap, t)}
                            arrow>
                            <TableCell
                              sx={{
                                ...cellStyle,
                                background: colors[status],
                                cursor: hasRide ? 'pointer' : 'default',
                                '& a, & a:visited, & a:hover, & a:focus': {
                                  color: 'primary.main',
                                  textDecoration: 'none',
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
                  )
                })}
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

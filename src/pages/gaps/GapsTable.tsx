import {
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableRow,
} from '@mui/material'
import { Skeleton } from 'antd'
import { TFunction } from 'i18next'
import React, { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Gap, GapsList } from '../../model/gaps'
import DisplayGapsPercentage from '../components/DisplayGapsPercentage'
import { Row } from '../components/Row'
import dayjs from 'src/dayjs'
import Widget from 'src/shared/Widget'

interface GapsTableProps {
  gaps?: GapsList
  loading?: boolean
  initOnlyGapped?: boolean
}

function getGapsPercentage(gaps: GapsList | undefined, t: TFunction): number | undefined {
  if (!gaps || gaps.length === 0) return undefined
  const statusAsPlanned = t('ride_as_planned')
  const statusMissing = t('ride_missing')
  let relevantCount = 0
  let missingCount = 0
  for (const gap of gaps) {
    const status = formatStatus(gap, gaps, t)
    if (status === statusAsPlanned || status === statusMissing) {
      relevantCount++
      if (status === statusMissing) {
        missingCount++
      }
    }
  }
  if (relevantCount === 0) return undefined
  return (missingCount / relevantCount) * 100
}

function formatStatus(gap: Gap, gaps: GapsList | undefined, t: TFunction): string {
  if (gap.gtfsTime?.isAfter(dayjs()) && !gap.siriTime) {
    return t('ride_in_future')
  }
  if (!gap.siriTime) {
    return t('ride_missing')
  }
  if (gap.gtfsTime && gap.siriTime) {
    return t('ride_as_planned')
  }
  const hasTwinRide = gaps?.some(
    (g) => g.gtfsTime && g.siriTime && gap.siriTime && g.siriTime.isSame(gap.siriTime),
  )
  if (hasTwinRide) {
    return t('ride_duped')
  }
  return t('ride_extra')
}

function formatTime(time: dayjs.Dayjs | null): string | undefined {
  return time?.format('HH:mm')
}

const groupByHours = (gaps: Gap[]) => {
  const hours: Record<string, typeof gaps> = {}
  for (const gap of gaps) {
    const hour = (gap.gtfsTime?.get('hour') || gap.siriTime?.get('hour'))?.toString()
    if (!hour) continue
    if (!hours[hour]) hours[hour] = []
    hours[hour].push(gap)
  }
  return hours
}

const GapsTable: React.FC<GapsTableProps> = ({ gaps, loading, initOnlyGapped = false }) => {
  const { t } = useTranslation()
  const [onlyGapped, setOnlyGapped] = useState(initOnlyGapped)

  const gapsPercentage = useMemo(() => getGapsPercentage(gaps, t), [gaps, t])

  const filteredGaps = useMemo(() => {
    if (!gaps) return []
    return gaps
      ?.filter((gap) => {
        return onlyGapped
          ? !gap.siriTime && gap.gtfsTime?.isBefore(dayjs())
          : gap.gtfsTime || gap.siriTime
      })
      .sort((t1, t2) => {
        return Number((t1?.siriTime || t1?.gtfsTime)?.diff(t2?.siriTime || t2?.gtfsTime))
      })
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
        <Table size="small">
          <TableBody>
            {Object.values(groupByHours(filteredGaps)).map((gaps, i) => (
              <TableRow key={i}>
                {gaps.map((gap, j) => {
                  const time = formatTime(gap.gtfsTime || gap.siriTime)
                  const status = formatStatus(gap, gaps, t)
                  return (
                    <TableCell
                      sx={{
                        padding: '6px',
                        textAlign: 'center',
                        background:
                          status === t('ride_as_planned')
                            ? 'rgba(0, 255, 0, 0.2)'
                            : status === t('ride_missing')
                              ? 'rgba(255, 0, 0, 0.2)'
                              : status === t('ride_duped')
                                ? 'rgba(255, 0, 255, 0.2)'
                                : status === t('ride_extra')
                                  ? 'rgba(255, 255, 0, 0.2)'
                                  : status === t('ride_in_future')
                                    ? 'rgba(0, 0, 255, 0.2)'
                                    : undefined,
                        border: '1px solid rgba(128, 128, 128, 0.22) !important',
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
      <Table>
        <TableRow>
          <TableCell
            sx={{
              padding: '6px',
              textAlign: 'center',
              background: 'rgba(0, 255, 0, 0.2)',
              border: '1px solid rgba(128, 128, 128, 0.22) !important',
            }}>
            {t('ride_as_planned')}
          </TableCell>
          <TableCell
            sx={{
              padding: '6px',
              textAlign: 'center',
              background: 'rgba(255, 0, 0, 0.2)',
              border: '1px solid rgba(128, 128, 128, 0.22) !important',
            }}>
            {t('ride_missing')}
          </TableCell>
          <TableCell
            sx={{
              padding: '6px',
              textAlign: 'center',
              background: 'rgba(255, 255, 0, 0.2)',
              border: '1px solid rgba(128, 128, 128, 0.22) !important',
            }}>
            {t('ride_extra')}
          </TableCell>
          <TableCell
            sx={{
              padding: '6px',
              textAlign: 'center',
              background: 'rgba(255, 0, 255, 0.2)',
              border: '1px solid rgba(128, 128, 128, 0.22) !important',
            }}>
            {t('ride_duped')}
          </TableCell>
          <TableCell
            sx={{
              padding: '6px',
              textAlign: 'center',
              background: 'rgba(0, 0, 255, 0.2)',
              border: '1px solid rgba(128, 128, 128, 0.22) !important',
            }}>
            {t('ride_in_future')}
          </TableCell>
        </TableRow>
      </Table>
    </TableContainer>
  )
}

export default memo(GapsTable)

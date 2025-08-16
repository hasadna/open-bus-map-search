import {
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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

function formatTime(
  time: dayjs.Dayjs | null,
  t: TFunction<'translation', undefined>,
): string | undefined {
  return time?.format(t('time_format'))
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
          <TableHead>
            <TableRow>
              <TableCell>{t('planned_time')}</TableCell>
              <TableCell>{t('planned_status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGaps.map((gap, i) => (
              <TableRow key={i}>
                <TableCell>{formatTime(gap.gtfsTime || gap.siriTime, t)}</TableCell>
                <TableCell>{formatStatus(gap, gaps, t)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  )
}

export default memo(GapsTable)

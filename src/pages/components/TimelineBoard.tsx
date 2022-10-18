import React from 'react'
import moment, { Moment } from 'moment'
import { MAX_HITS_COUNT } from 'src/api/apiConfig'
import styled from 'styled-components'
import { Timeline } from 'src/pages/components/Timeline'
import { PointType } from 'src/pages/components/TimelinePoint'

const COLUMN_WIDTH = 160

const getRange = (timestamps: Date[]) =>
  timestamps.length > 0
    ? moment(timestamps[timestamps.length - 1]).diff(timestamps[0], 'seconds')
    : 0

const minDate = (date1: Date, date2: Date) => (date1 <= date2 ? date1 : date2)

const Container = styled.div`
  display: flex;
`

const StyledTimeline = styled(Timeline)<{ shift: number }>`
  width: ${COLUMN_WIDTH}px;
  margin-left: 16px;
`

type TimelineBoardProps = {
  className?: string
  target: Moment
  gtfsTimes: Date[]
  siriTimes: Date[]
}

export const TimelineBoard = ({ className, target, gtfsTimes, siriTimes }: TimelineBoardProps) => {
  const gtfsRange = getRange(gtfsTimes)
  const siriRange = getRange(siriTimes)

  const lowerBound = minDate(gtfsTimes[0] ?? Date.now(), siriTimes[0] ?? Date.now())
  const totalRange = Math.max(gtfsRange, siriRange)
  const totalHeight = 400 + (Math.max(gtfsTimes.length, siriTimes.length) / MAX_HITS_COUNT) * 400

  return (
    <Container className={className}>
      <StyledTimeline
        shift={0}
        timestamps={[target.toDate()]}
        lowerBound={lowerBound}
        totalHeight={totalHeight}
        totalRange={totalRange}
        pointType={PointType.TARGET}
      />
      <StyledTimeline
        shift={1}
        timestamps={gtfsTimes}
        lowerBound={lowerBound}
        totalHeight={totalHeight}
        totalRange={totalRange}
        pointType={PointType.GTFS}
      />
      <StyledTimeline
        shift={1}
        timestamps={siriTimes}
        lowerBound={lowerBound}
        totalHeight={totalHeight}
        totalRange={totalRange}
        pointType={PointType.SIRI}
      />
    </Container>
  )
}

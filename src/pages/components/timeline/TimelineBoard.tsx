import React, { useCallback } from 'react'
import moment, { Moment } from 'moment'
import { MAX_HITS_COUNT } from 'src/api/apiConfig'
import styled from 'styled-components'
import { Timeline } from 'src/pages/components/timeline/Timeline'
import { PointType } from 'src/pages/components/timeline/TimelinePoint'
import { HorizontalLine } from 'src/pages/components/timeline/HorizontalLine'

const COLUMN_WIDTH = 160
export const PADDING = 10

const getRange = (timestamps: Date[]) =>
  timestamps.length > 0
    ? moment(timestamps[timestamps.length - 1]).diff(timestamps[0], 'seconds')
    : 0

const minDate = (date1: Date, date2: Date) => (date1 <= date2 ? date1 : date2)

const Container = styled.div`
  position: relative;
  display: flex;
`

const StyledTimeline = styled(Timeline)`
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

  const allTimestamps: Set<Date> = new Set([target.toDate(), ...gtfsTimes, ...siriTimes])

  const timestampToTop = useCallback(
    (timestamp: Moment) => {
      const deltaFromTop = timestamp.diff(lowerBound, 'seconds')
      const portionOfHeight = deltaFromTop / totalRange
      return Math.min(PADDING + portionOfHeight * totalHeight, totalHeight)
    },
    [lowerBound, totalRange, totalHeight],
  )

  return (
    <Container className={className}>
      <StyledTimeline
        timestamps={[target.toDate()]}
        totalHeight={totalHeight}
        pointType={PointType.TARGET}
        timestampToTop={timestampToTop}
      />
      <StyledTimeline
        timestamps={gtfsTimes}
        totalHeight={totalHeight}
        pointType={PointType.GTFS}
        timestampToTop={timestampToTop}
      />
      <StyledTimeline
        timestamps={siriTimes}
        totalHeight={totalHeight}
        pointType={PointType.SIRI}
        timestampToTop={timestampToTop}
      />
      {Array.from(allTimestamps).map((timestamp) => (
        <HorizontalLine key={timestamp.toString()} top={timestampToTop(moment(timestamp))} />
      ))}
    </Container>
  )
}

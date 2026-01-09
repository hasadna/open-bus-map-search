import {
  GtfsRideStopWithRelatedPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { MAX_HITS_COUNT } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import { Coordinates } from 'src/model/location'
import { HorizontalLine } from 'src/pages/components/timeline/HorizontalLine'
import { Timeline } from 'src/pages/components/timeline/Timeline'
import { PointType } from 'src/pages/components/timeline/TimelinePoint'

const COLUMN_WIDTH = 140
export const PADDING = 10

const getRange = (timestamps: Date[]) =>
  timestamps.length > 0 ? dayjs(timestamps[timestamps.length - 1]).diff(timestamps[0], 'second') : 0

const minDate = (date1: Date, date2: Date) => (date1 <= date2 ? date1 : date2)

const Container = styled.div`
  position: relative;
  display: flex;
`
const StyledContainer = styled.div`
  overflow-x: hidden;
  flex-direction: column;
  margin-right: 8px;
`
const StyledTimeline = styled(Timeline)`
  min-width: ${COLUMN_WIDTH}px;
  margin-left: 16px;
  margin-right: 16px;
`

type TimelineBoardProps = {
  className?: string
  target: dayjs.Dayjs
  gtfsTimes: GtfsRideStopWithRelatedPydanticModel[]
  siriTimes: (SiriVehicleLocationWithRelatedPydanticModel & Coordinates)[]
}

export const TimelineBoard = ({ className, target, gtfsTimes, siriTimes }: TimelineBoardProps) => {
  const { t } = useTranslation()
  const gtfsDates = gtfsTimes.map((t) => t.arrivalTime!)
  const siriDates = siriTimes.map((t) => t.recordedAtTime!)
  const gtfsRange = getRange(gtfsDates)
  const siriRange = getRange(siriDates)

  const lowerBound = minDate(gtfsDates[0] ?? Date.now(), siriDates[0] ?? Date.now())
  const totalRange = Math.max(gtfsRange, siriRange)
  const totalHeight = 400 + (Math.max(gtfsTimes.length, siriTimes.length) / MAX_HITS_COUNT) * 400

  const allTimestamps: Set<Date> = new Set([target.toDate(), ...gtfsDates, ...siriDates])

  const timestampToTop = useCallback(
    (timestamp: dayjs.Dayjs) => {
      const deltaFromTop = timestamp.diff(lowerBound, 'second')
      const portionOfHeight = deltaFromTop / totalRange
      return Math.min(PADDING + portionOfHeight * totalHeight, totalHeight)
    },
    [lowerBound, totalRange, totalHeight],
  )
  return (
    <StyledContainer>
      <h4>
        {t('timestamp_target')} {target.format('DD/MM/YYYY HH:mm:ss')}
      </h4>
      <Container className={className}>
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
        {Array.from(allTimestamps).map((timestamp, index) => (
          <HorizontalLine key={index} top={timestampToTop(dayjs(timestamp))} />
        ))}
      </Container>
    </StyledContainer>
  )
}

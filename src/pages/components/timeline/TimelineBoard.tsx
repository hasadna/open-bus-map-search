import {
  GtfsRideStopWithRelatedPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { MAX_HITS_COUNT } from 'src/api/apiConfig'
import { parseInstant, serializeInstant } from 'src/dayjs'
import { useTheme } from 'src/layout/ThemeContext'
import { Coordinates } from 'src/model/location'
import { HorizontalLine } from 'src/pages/components/timeline/HorizontalLine'
import { Timeline, TimelineTitle } from 'src/pages/components/timeline/Timeline'
import { PointType } from 'src/pages/components/timeline/TimelinePoint'

export const PADDING = 10
const COLUMN_GAP = 32

const getRange = (timestamps: Date[]) =>
  timestamps.length > 0
    ? (timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / 1000
    : 0

const minDate = (date1: Date, date2: Date) => (date1 <= date2 ? date1 : date2)

const TitleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${COLUMN_GAP}px;
  margin-bottom: 16px;
`

const StyledTimelineTitle = styled(TimelineTitle)`
  display: block;
  text-align: center;
`

const Container = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${COLUMN_GAP}px;
`
const CenteringWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

type TimelineBoardProps = {
  className?: string
  target: string // instant (ISO with Israel offset)
  gtfsTimes: GtfsRideStopWithRelatedPydanticModel[]
  siriTimes: (SiriVehicleLocationWithRelatedPydanticModel & Coordinates)[]
}

export const TimelineBoard = ({ className, target, gtfsTimes, siriTimes }: TimelineBoardProps) => {
  const { isDarkTheme } = useTheme()
  const [hoveredTimestamp, setHoveredTimestamp] = useState<string | undefined>(undefined)
  const gtfsDates = gtfsTimes.map((t) => t.arrivalTime!)
  const siriDates = siriTimes.map((t) => t.recordedAtTime!)
  const gtfsRange = getRange(gtfsDates)
  const siriRange = getRange(siriDates)

  const lowerBound = minDate(gtfsDates[0] ?? Date.now(), siriDates[0] ?? Date.now())
  const totalRange = Math.max(gtfsRange, siriRange)
  const totalHeight = 400 + (Math.max(gtfsTimes.length, siriTimes.length) / MAX_HITS_COUNT) * 400

  // Canonical instant strings so the hover key matches the per-column keys in <Timeline/>.
  const allTimestamps = new Set<string>([
    serializeInstant(target),
    ...gtfsDates.map(serializeInstant),
    ...siriDates.map(serializeInstant),
  ])

  const timestampToTop = useCallback(
    (timestamp: string | Date) => {
      const instant = parseInstant(timestamp)
      if (!instant) return PADDING
      const deltaFromTop = instant.diff(lowerBound, 'second')
      const portionOfHeight = deltaFromTop / totalRange
      return Math.min(PADDING + portionOfHeight * totalHeight, totalHeight)
    },
    [lowerBound, totalRange, totalHeight],
  )

  return (
    <CenteringWrapper className={className}>
      <StyledContainer
        style={{
          '--timeline-neutral': isDarkTheme ? '#8c8c8c' : '#bfbfbf',
          '--timeline-highlight-ring': isDarkTheme ? 'white' : '#333',
        }}>
        <TitleRow>
          <StyledTimelineTitle pointType={PointType.GTFS} />
          <StyledTimelineTitle pointType={PointType.SIRI} />
        </TitleRow>
        <Container>
          <Timeline
            timestamps={gtfsTimes}
            totalHeight={totalHeight}
            pointType={PointType.GTFS}
            timestampToTop={timestampToTop}
            hoveredTimestamp={hoveredTimestamp}
          />
          <Timeline
            timestamps={siriTimes}
            totalHeight={totalHeight}
            pointType={PointType.SIRI}
            timestampToTop={timestampToTop}
            hoveredTimestamp={hoveredTimestamp}
          />
          {Array.from(allTimestamps).map((tsKey, index) => (
            <HorizontalLine
              key={index}
              top={timestampToTop(tsKey)}
              externalVisible={hoveredTimestamp === tsKey}
              onHoverChange={(entering) => setHoveredTimestamp(entering ? tsKey : undefined)}
            />
          ))}
        </Container>
      </StyledContainer>
    </CenteringWrapper>
  )
}

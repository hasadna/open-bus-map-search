import { GtfsRideStopWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { MAX_HITS_COUNT } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import { useTheme } from 'src/layout/ThemeContext'
import { HorizontalLine } from 'src/pages/components/timeline/HorizontalLine'
import { Timeline, TimelineTitle } from 'src/pages/components/timeline/Timeline'
import {
  type BandDeviation,
  bandDeviation,
  deviationSpans,
  hitTime,
  instantY,
  pairTimelineHits,
  pickBandKey,
  type SiriHit,
} from 'src/pages/components/timeline/timelinePairing'
import { PointType } from 'src/pages/components/timeline/TimelinePoint'

export const PADDING = 10
const COLUMN_GAP = 32

/** The window both columns are drawn against.
 *
 *  It spans every hit on the board, planned and actual alike. Measuring each column's own
 *  range instead let an actual time fall outside the scale — every one past it collapsed
 *  onto the bottom pixel, so rides seconds apart shared a dot. */
const boardWindow = (timestamps: Date[]) => {
  const instants = timestamps.map((t) => dayjs(t).valueOf()).filter(Number.isFinite)
  if (instants.length === 0) return { lowerBound: Date.now(), rangeSeconds: 0 }
  const lowerBound = Math.min(...instants)
  return { lowerBound, rangeSeconds: (Math.max(...instants) - lowerBound) / 1000 }
}

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

/**
 * One ride's deviation: height IS the delay, so the worse it ran the more coloured surface
 * it puts on screen. The bounding rules are this element's own borders, which is what keeps
 * them exactly on its edges.
 *
 * Early and late blocks meet at the scheduled instant and so never overlap — stacking
 * translucent fills would darken into a severity nobody claimed.
 */
const Band = styled.div<{
  $top: number
  $height: number
  $rgb: string
}>`
  position: absolute;
  left: 0;
  width: 100%;
  top: ${({ $top }) => $top}px;
  height: ${({ $height }) => $height}px;
  min-height: 2px;
  box-sizing: border-box;
  background-color: rgb(${({ $rgb }) => $rgb} / 30%);
  border-top: 1px solid rgb(${({ $rgb }) => $rgb} / 85%);
  border-bottom: 1px solid rgb(${({ $rgb }) => $rgb} / 85%);
  border-radius: 3px;
  user-select: none;
  pointer-events: none;
`

/** Red for late, amber for early — both are deviations, so neither gets a "good" colour.
 *  A ride that ran to plan keeps the neutral wash. */
const deviationRgb = (deviation: BandDeviation) => {
  if (deviation === 'late') return 'var(--timeline-late)'
  if (deviation === 'early') return 'var(--timeline-early)'
  return 'var(--timeline-neutral-rgb)'
}

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
  target: dayjs.Dayjs
  gtfsTimes: GtfsRideStopWithRelatedPydanticModel[]
  siriTimes: SiriHit[]
}

export const TimelineBoard = ({ className, target, gtfsTimes, siriTimes }: TimelineBoardProps) => {
  const { isDarkTheme } = useTheme()
  const [hoveredBand, setHoveredBand] = useState<string | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lowerBound, rangeSeconds } = boardWindow([
    ...gtfsTimes.map((t) => hitTime(t)),
    ...siriTimes.map((t) => hitTime(t)),
  ])
  const totalHeight = 400 + (Math.max(gtfsTimes.length, siriTimes.length) / MAX_HITS_COUNT) * 400

  const timestampToTop = useCallback(
    (timestamp: dayjs.Dayjs) => {
      // A board whose hits all share one instant has no scale — put them on one line
      // rather than dividing by zero into NaN.
      const portionOfHeight =
        rangeSeconds > 0 ? timestamp.diff(lowerBound, 'second') / rangeSeconds : 0
      return PADDING + portionOfHeight * totalHeight
    },
    [lowerBound, rangeSeconds, totalHeight],
  )

  const { gtfsKeys, siriKeys, bands } = useMemo(
    () => pairTimelineHits(gtfsTimes, siriTimes, (hit) => timestampToTop(dayjs(hitTime(hit)))),
    [gtfsTimes, siriTimes, timestampToTop],
  )

  const activeBand = bands.find((band) => band.key === hoveredBand)
  const activeSpans = activeBand ? deviationSpans(activeBand) : []

  // A ride with only one of its two dots gets a marker on the axis it is missing from,
  // at the y of the dot it does have — permanent, because an absent counterpart is a fact
  // about the data rather than something you should have to hover to discover.
  const absentMarks = useMemo(
    () =>
      bands.flatMap((band) => {
        const deviation = bandDeviation(band)
        if (deviation === 'no-show')
          return [{ key: band.key, top: Math.min(...band.plannedTops), column: PointType.SIRI }]
        if (deviation === 'unscheduled')
          return [{ key: band.key, top: Math.min(...band.actualTops), column: PointType.GTFS }]
        return []
      }),
    [bands],
  )

  const trackPointer = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = containerRef.current?.getBoundingClientRect()
    if (bounds) setHoveredBand(pickBandKey(bands, event.clientY - bounds.top))
  }

  return (
    <CenteringWrapper className={className}>
      <StyledContainer
        // deviation colours are rgb triplets, so a fill and its edge rule can share one
        // element at different alphas
        style={{
          '--timeline-neutral': isDarkTheme ? '#8c8c8c' : '#bfbfbf',
          '--timeline-neutral-rgb': isDarkTheme ? '140 140 140' : '191 191 191',
          '--timeline-highlight-ring': isDarkTheme ? 'white' : '#333',
          '--timeline-surface': isDarkTheme ? '#1f1f1f' : '#fff',
          '--timeline-late': isDarkTheme ? '255 77 79' : '245 34 45',
          '--timeline-early': isDarkTheme ? '255 169 64' : '250 140 22',
        }}>
        <TitleRow>
          <StyledTimelineTitle pointType={PointType.GTFS} />
          <StyledTimelineTitle pointType={PointType.SIRI} />
        </TitleRow>
        <Container
          data-testid="timeline-board"
          ref={containerRef}
          onMouseMove={trackPointer}
          onMouseLeave={() => setHoveredBand(undefined)}>
          {activeSpans.map((span) => (
            <Band
              key={span.deviation}
              data-testid="timeline-band"
              $top={span.top}
              $height={span.bottom - span.top}
              $rgb={deviationRgb(span.deviation)}
            />
          ))}
          <HorizontalLine top={instantY(timestampToTop(target))} isTarget />
          <Timeline
            timestamps={gtfsTimes}
            totalHeight={totalHeight}
            pointType={PointType.GTFS}
            timestampToTop={timestampToTop}
            bandKeys={gtfsKeys}
            hoveredBand={hoveredBand}
            absentMarks={absentMarks.filter((mark) => mark.column === PointType.GTFS)}
          />
          <Timeline
            timestamps={siriTimes}
            totalHeight={totalHeight}
            pointType={PointType.SIRI}
            timestampToTop={timestampToTop}
            bandKeys={siriKeys}
            hoveredBand={hoveredBand}
            absentMarks={absentMarks.filter((mark) => mark.column === PointType.SIRI)}
          />
        </Container>
      </StyledContainer>
    </CenteringWrapper>
  )
}

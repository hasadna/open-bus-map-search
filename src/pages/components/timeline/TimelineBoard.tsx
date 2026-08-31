import { GtfsRideStopWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { MAX_HITS_COUNT } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import { useTheme } from 'src/layout/ThemeContext'
import { HorizontalLine } from 'src/pages/components/timeline/HorizontalLine'
import { cardHeight, LABEL_GAP, PADDING } from 'src/pages/components/timeline/layout'
import { RideVehicle, WIDEST_VEHICLE } from 'src/pages/components/timeline/RideVehicle'
import { Timeline, type TimelineLink, TimelineTitle } from 'src/pages/components/timeline/Timeline'
import {
  type BandDeviation,
  bandDeviation,
  departureKey,
  deviationSpans,
  hitTime,
  instantY,
  pairTimelineHits,
  pickBandKey,
  type SiriHit,
  type TimelineHit,
} from 'src/pages/components/timeline/timelinePairing'
import { ABSENT_MARK_SIZE, PointType } from 'src/pages/components/timeline/TimelinePoint'

const COLUMN_GAP = 32
/** A planned stop has nothing under its time to show. */
const PLANNED_CARD_HEIGHT = cardHeight(0)
/** What a ✕ or ? costs the label lane it stands in. */
const MARK_SLOT = ABSENT_MARK_SIZE + LABEL_GAP

/** How many markers a column will carry: one per departure the other column knows and this
 *  one does not. Bands pair on the departure minute alone, so this is settled before any
 *  geometry is — which is what lets the axis be sized off it. */
const unpairedDepartures = (hits: TimelineHit[], counterparts: TimelineHit[]) => {
  const paired = new Set(counterparts.map(departureKey))
  const unpaired = new Set<string>()
  for (const hit of hits) {
    const key = departureKey(hit)
    // A hit with no departure time could never have paired, so it says nothing is missing.
    if (key !== undefined && !paired.has(key)) unpaired.add(key)
  }
  return unpaired.size
}

/** Both columns share one scale: per-column ranges let the other column's later hits fall
 *  past the bottom and collapse onto a single pixel. */
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

/** Faint when idle, deep under the pointer. */
const alpha =
  (idle: number, hovered: number) =>
  ({ $highlighted }: { $highlighted: boolean }) =>
    `${$highlighted ? hovered : idle}%`

/** Height IS the delay, so the worse a ride ran the more coloured surface it puts on screen.
 *  Every ride is drawn, not just the hovered one, and the fills are faint enough to compound:
 *  where several rides ran off schedule over the same minutes the overlap darkens, and that
 *  darkness is the honest reading — a whole window of buses missed, not one. (Within a single
 *  band early and late still abut at the scheduled instant, so no ride doubles its own colour.) */
const Band = styled.div<{
  $top: number
  $height: number
  $rgb: string
  $highlighted: boolean
}>`
  position: absolute;
  left: 0;
  width: 100%;
  top: ${({ $top }) => $top}px;
  height: ${({ $height }) => $height}px;
  min-height: 2px;
  box-sizing: border-box;
  background-color: rgb(${({ $rgb }) => $rgb} / ${alpha(12, 40)});
  border-top: 1px solid rgb(${({ $rgb }) => $rgb} / ${alpha(25, 90)});
  border-bottom: 1px solid rgb(${({ $rgb }) => $rgb} / ${alpha(25, 90)});
  border-radius: 3px;
  user-select: none;
  pointer-events: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
`

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
  /** Deep-links each actual (SIRI) time to the ride it belongs to. */
  siriLinkFor?: (siriTime: SiriHit) => TimelineLink | undefined
}

export const TimelineBoard = ({
  className,
  target,
  gtfsTimes,
  siriTimes,
  siriLinkFor,
}: TimelineBoardProps) => {
  const { isDarkTheme } = useTheme()
  // The plate row, plus the map row Timeline adds for a column that links out.
  const actualCardHeight = cardHeight(siriLinkFor ? 2 : 1)
  const [hoveredBand, setHoveredBand] = useState<string | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lowerBound, rangeSeconds } = boardWindow([
    ...gtfsTimes.map((t) => hitTime(t)),
    ...siriTimes.map((t) => hitTime(t)),
  ])
  // Labels are pushed apart until none overlap, so the axis has to be at least as tall as a
  // column's worth of them — its cards AND the markers standing in for the rides missing
  // from it, which share the one label lane. Short of that the resolver, which pins the
  // lowest label to the end of the axis, drives the surplus off the top.
  const stackHeight = Math.max(
    gtfsTimes.length * (PLANNED_CARD_HEIGHT + LABEL_GAP) +
      unpairedDepartures(siriTimes, gtfsTimes) * MARK_SLOT,
    siriTimes.length * (actualCardHeight + LABEL_GAP) +
      unpairedDepartures(gtfsTimes, siriTimes) * MARK_SLOT,
  )
  const totalHeight = Math.max(
    400 + (Math.max(gtfsTimes.length, siriTimes.length) / MAX_HITS_COUNT) * 400,
    stackHeight,
  )

  const timestampToTop = useCallback(
    (timestamp: dayjs.Dayjs) => {
      // A board whose hits all share one instant has no scale — one line, not NaN.
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

  const spans = useMemo(
    () =>
      bands.flatMap((band) => deviationSpans(band).map((span) => ({ ...span, bandKey: band.key }))),
    [bands],
  )

  // The marker goes on the column the ride is missing FROM, at the y of the dot it does have.
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
          '--timeline-card-bg': isDarkTheme ? '#1c1d1c' : '#fff',
          '--timeline-absent-fill': isDarkTheme ? '#fff' : '#000',
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
          {spans.map((span) => (
            <Band
              key={`${span.bandKey}_${span.deviation}`}
              data-testid="timeline-band"
              $top={span.top}
              $height={span.bottom - span.top}
              $rgb={deviationRgb(span.deviation)}
              $highlighted={span.bandKey === hoveredBand}
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
            cards={{ height: PLANNED_CARD_HEIGHT }}
          />
          <Timeline
            timestamps={siriTimes}
            totalHeight={totalHeight}
            pointType={PointType.SIRI}
            timestampToTop={timestampToTop}
            bandKeys={siriKeys}
            hoveredBand={hoveredBand}
            absentMarks={absentMarks.filter((mark) => mark.column === PointType.SIRI)}
            linkFor={siriLinkFor && ((index) => siriLinkFor(siriTimes[index]))}
            cards={{
              height: actualCardHeight,
              content: siriTimes.map((hit) => <RideVehicle key={hit.id} hit={hit} />),
              widest: <RideVehicle hit={WIDEST_VEHICLE} />,
            }}
          />
        </Container>
      </StyledContainer>
    </CenteringWrapper>
  )
}

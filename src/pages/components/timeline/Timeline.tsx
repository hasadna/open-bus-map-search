import CloseIcon from '@mui/icons-material/Close'
import MapIcon from '@mui/icons-material/Map'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { Box, Link as MuiLink, Tooltip } from '@mui/material'
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import styled, { css } from 'styled-components'
import dayjs from 'src/dayjs'
import { CARD_DETAILS_SX, CardRow } from 'src/pages/components/timeline/CardRow'
import {
  CARD_PADDING_X,
  CARD_PADDING_Y,
  CARD_TIME_FONT_SIZE,
  CARD_TIME_HEIGHT,
  LABEL_GAP,
  LABEL_HEIGHT,
  PADDING,
} from 'src/pages/components/timeline/layout'
import { hitTime, instantY, type TimelineHit } from 'src/pages/components/timeline/timelinePairing'
import {
  ABSENT_COLOR,
  ABSENT_MARK_SIZE,
  NEUTRAL_COLOR,
  Point,
  POINT_SIZE,
  PointType,
  pointTypeToColor,
  pointTypeToDescription,
} from 'src/pages/components/timeline/TimelinePoint'

const LABEL_ICON_GAP = 2
// Keeps the icon inside LABEL_HEIGHT, so neighbouring labels can't touch.
const LABEL_ICON_SIZE = '1.1em'
const LABEL_OFFSET = 20 // gap between axis and label area
const CONNECTOR_HORIZ = 8
const DOT_CENTER_X = 2 + 3 - POINT_SIZE / 2 // = 1

const Line = styled.div<{ $totalHeight: number }>`
  height: ${({ $totalHeight }) => $totalHeight + PADDING * 3}px;
  width: 2px;
  background-color: ${NEUTRAL_COLOR};
`

const BoundaryTick = styled.div.withConfig({ componentId: 'sc-boundary-tick' })<{ $top: number }>`
  width: 12px;
  height: 2px;
  background-color: ${NEUTRAL_COLOR};
  position: absolute;
  top: ${({ $top }) => $top}px;
  right: -5px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Title = styled.span<{ $pointType: PointType }>`
  font-weight: bold;
  background-color: ${({ $pointType }) => pointTypeToColor[$pointType]};
  padding: 2px 8px;
  white-space: nowrap;
  font-size: clamp(8px, 2.5vw, 16px);
`

const Container = styled.div`
  display: flex;
`

const AxisArea = styled.div`
  position: relative;
  width: 2px;
  flex-shrink: 0;
`

const LabelArea = styled.div`
  position: relative;
  margin-inline-start: ${LABEL_OFFSET}px;
`

const WidthAnchor = styled.span<{ $card?: boolean }>`
  display: flex;
  flex-direction: ${({ $card }) => ($card ? 'column' : 'row')};
  align-items: ${({ $card }) => ($card ? 'stretch' : 'center')};
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;

  ${({ $card }) =>
    $card &&
    css`
      padding: ${CARD_PADDING_Y}px ${CARD_PADDING_X}px;
      border: 1px solid transparent;
    `}
`

const Label = styled.div<{ $top: number; $highlighted?: boolean; $card?: boolean }>`
  position: absolute;
  top: ${({ $top }) => $top - POINT_SIZE + 1}px;
  inset-inline-start: 0;
  z-index: 2;
  display: flex;
  align-items: ${({ $card }) => ($card ? 'stretch' : 'center')};
  flex-direction: ${({ $card }) => ($card ? 'column' : 'row')};
  gap: ${({ $card }) => ($card ? 0 : LABEL_ICON_GAP)}px;
  white-space: nowrap;
  font-weight: ${({ $highlighted }) => ($highlighted ? 'bold' : 'normal')};

  ${({ $card, $highlighted }) =>
    $card &&
    css`
      /* The column already reserves room for the widest card, so filling it keeps every
         card the same width instead of leaving a ragged edge down the timeline. */
      inset-inline-end: 0;
      /* The deviation fills run the width of the whole board, so a card needs ground of
         its own to stay legible over one. They still read either side of the column. */
      background-color: var(--timeline-card-bg, #fff);
      padding: ${CARD_PADDING_Y}px ${CARD_PADDING_X}px;
      border: 1px solid ${$highlighted ? 'var(--timeline-highlight-ring, #333)' : NEUTRAL_COLOR};
      /* A ring rather than a thicker border: cardHeight lays the column out from
         CARD_BORDER, so growing the border itself would shift every card below it. */
      box-shadow: ${$highlighted ? '0 0 0 1px var(--timeline-highlight-ring, #333)' : 'none'};
      border-radius: 4px;
      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
    `}
`

const CARD_TIME_ROW_SX = {
  fontSize: CARD_TIME_FONT_SIZE,
  lineHeight: `${CARD_TIME_HEIGHT}px`,
}

/** The inside of a card. The width anchor renders this too, so the two can't drift apart
 *  and mis-reserve the column's width. */
const CardBody = ({
  time,
  mapLink,
  details,
}: {
  time: ReactNode
  mapLink?: ReactNode
  details?: ReactNode
}) => (
  <>
    <Box sx={CARD_TIME_ROW_SX}>{time}</Box>
    {(mapLink || details) && (
      <Box sx={CARD_DETAILS_SX}>
        {mapLink}
        {details}
      </Box>
    )}
  </>
)

const ConnectorSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  pointer-events: none;
  overflow: visible;
`

/** Stands in for a dot that never came, in the label lane at the y of the dot the ride does
 *  have on the other axis. */
const AbsentMark = styled.span<{ $top: number; $highlighted?: boolean }>`
  position: absolute;
  top: ${({ $top }) => $top - POINT_SIZE + 1}px;
  inset-inline-start: 0;
  box-sizing: border-box;
  width: ${ABSENT_MARK_SIZE}px;
  height: ${ABSENT_MARK_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--timeline-absent-fill, #000);
  border: 2px solid rgb(var(--timeline-late));
  color: ${ABSENT_COLOR};
  transform: ${({ $highlighted }) => ($highlighted ? 'scale(1.5)' : 'scale(1)')};
  transition: transform 0.15s ease;
  z-index: 3;

  /* MUI ships a single filled weight, so stroking the glyph's own outline is what gives it
     enough body to read at this size against the ring. */
  svg {
    font-size: ${ABSENT_MARK_SIZE - 6}px;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
`

const connectorColor = (absent: boolean, highlighted: boolean, pointType: PointType) => {
  if (absent) return ABSENT_COLOR
  return highlighted ? pointTypeToColor[pointType] : NEUTRAL_COLOR
}

const connectorOpacity = (absent: boolean, highlighted: boolean) => {
  if (highlighted) return 1
  return absent ? 0.9 : 0.8
}

/** Matches the ring the highlighted card puts on, so the label and the line that leads to
 *  it thicken together. */
const connectorWidth = (highlighted: boolean) => (highlighted ? 2 : 1)

/** Boxes share a top edge, so two are clear of each other once they sit the upper one's own
 *  height apart — which is why the gap is read off the earlier item. `bottom` is the last y
 *  the label lane owns: a box hangs below the point it names, so without it the lowest one
 *  would run off the end of the axis. */
function resolveCollisions(ys: number[], heights: number[], bottom: number): number[] {
  const lowestFor = (index: number) => bottom - heights[index]
  if (ys.length <= 1) return ys.map((y, index) => Math.min(y, lowestFor(index)))
  const indexed = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  const spacingAfter = (j: number) => heights[indexed[j].i] + LABEL_GAP
  for (let j = 1; j < indexed.length; j++) {
    const minY = indexed[j - 1].y + spacingAfter(j - 1)
    if (indexed[j].y < minY) indexed[j] = { ...indexed[j], y: minY }
  }
  // Pull the lowest box back on and let the upward pass carry that through the rest.
  const last = indexed.length - 1
  const lowest = lowestFor(indexed[last].i)
  if (indexed[last].y > lowest) indexed[last] = { ...indexed[last], y: lowest }
  for (let j = indexed.length - 2; j >= 0; j--) {
    const maxY = indexed[j + 1].y - spacingAfter(j)
    if (indexed[j].y > maxY) indexed[j] = { ...indexed[j], y: maxY }
  }
  const result = new Array<number>(ys.length)
  for (const { y, i } of indexed) result[i] = y
  return result
}

export const TimelineTitle = ({
  pointType,
  className,
}: {
  pointType: PointType
  className?: string
}) => {
  const { t } = useTranslation()
  return (
    <Title $pointType={pointType} className={className}>
      {t(pointTypeToDescription[pointType]!)}
    </Title>
  )
}

/** Turns a timestamp into a link — used by the SIRI column to open the ride it came from
 *  on the map. Returning undefined leaves that timestamp as plain text.
 *
 *  Followed as a real document navigation: the target reads its state out of the query
 *  string, which only happens on a fresh app mount. */
export type TimelineLink = { to: string; title: string }

type TimelineProps = {
  className?: string
  timestamps: TimelineHit[]
  totalHeight: number
  pointType: PointType
  timestampToTop: (timestamp: dayjs.Dayjs) => number
  /** Which band each timestamp belongs to — parallel to `timestamps`. */
  bandKeys?: string[]
  hoveredBand?: string
  /** Rides whose counterpart is missing from THIS column, at the y of the dot they do have. */
  absentMarks?: { key: string; top: number }[]
  linkFor?: (index: number) => TimelineLink | undefined
  /** Draws every label in this column as a bordered card. Without `content` a card holds
   *  nothing but its time — which is how the two columns stay symmetrical. */
  cards?: {
    /** Laid-out height of one card — see `cardHeight`. */
    height: number
    /** What each card carries under its time, in `timestamps` order. */
    content?: ReactNode[]
    /** The widest content there can be. Labels are absolutely positioned, so this is what
     *  reserves the column's width and keeps it centred under its title. */
    widest?: ReactNode
  }
}

export const Timeline = ({
  className,
  timestamps,
  totalHeight,
  pointType,
  timestampToTop,
  bandKeys,
  hoveredBand,
  absentMarks,
  linkFor,
  cards,
}: TimelineProps) => {
  const { i18n, t } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  const isActualColumn = pointType === PointType.SIRI
  const AbsentIcon = isActualColumn ? CloseIcon : QuestionMarkIcon
  const absentLabel = t(
    isActualColumn ? 'station_stops_no_actual_ride' : 'station_stops_unscheduled_ride',
  )

  // Times and absent markers share the label lane, so they are laid out as one list —
  // a marker that dodged only the other markers could still land on a time.
  const timeItems = timestamps.map((timestamp, i) => {
    const t = hitTime(timestamp)
    const naturalY = timestampToTop(dayjs(t))
    const highlighted = hoveredBand !== undefined && bandKeys?.[i] === hoveredBand
    return {
      key: `time_${i}`,
      naturalY,
      height: cards?.height ?? LABEL_HEIGHT,
      absent: false,
      highlighted,
      timeDisplay: dayjs(t).format('HH:mm:ss'),
      link: linkFor?.(i),
      details: cards?.content?.[i],
    }
  })

  const markItems = (absentMarks ?? []).map((mark) => ({
    key: `absent_${mark.key}`,
    naturalY: mark.top,
    height: ABSENT_MARK_SIZE,
    absent: true,
    highlighted: hoveredBand === mark.key,
  }))

  // Every link in a column shares one title, so the first stands in for all of them when
  // reserving the column's width.
  const anchorLink = linkFor?.(0)

  const items = [...timeItems, ...markItems]
  const resolvedYs = resolveCollisions(
    items.map((item) => item.naturalY),
    items.map((item) => item.height),
    // Label boxes start at `top - POINT_SIZE + 1` (see Label), so this is where the lane ends.
    totalHeight + PADDING * 3 + POINT_SIZE - 1,
  )

  return (
    <Wrapper className={className}>
      <Container>
        <AxisArea>
          <Line $totalHeight={totalHeight} />
          <BoundaryTick $top={-1} />
          <BoundaryTick $top={totalHeight + PADDING * 3 - 1} />

          <ConnectorSvg>
            {items.map((item, index) => {
              const resolvedY = resolvedYs[index]
              const { absent } = item
              // A card sits well clear of its axis and a marker has no dot of its own, so
              // both read as unattached without a leader line. A bare time label only needs
              // one once something has pushed it off its instant.
              const displaced = Math.abs(resolvedY - item.naturalY) >= 1
              if (!cards && !absent && !displaced) return null
              const axisY = instantY(item.naturalY)
              const labelY = resolvedY - POINT_SIZE + 1 + item.height / 2
              const color = connectorColor(absent, item.highlighted, pointType)
              const opacity = connectorOpacity(absent, item.highlighted)
              const labelEdgeX = isRtl ? -LABEL_OFFSET : 2 + LABEL_OFFSET
              const horizEndX = isRtl ? labelEdgeX + CONNECTOR_HORIZ : labelEdgeX - CONNECTOR_HORIZ
              return (
                <path
                  key={`${item.key}_conn`}
                  d={`M ${labelEdgeX} ${labelY} L ${horizEndX} ${labelY} L ${DOT_CENTER_X} ${axisY}`}
                  stroke={color}
                  strokeWidth={connectorWidth(item.highlighted)}
                  fill="none"
                  opacity={opacity}
                />
              )
            })}
          </ConnectorSvg>

          {/* Deliberately not links, unlike the labels: dots sit at their natural y, so
              several can land on the same pixel (rides seconds apart, or clamped to the
              bottom of the axis) and a click could not say which ride it meant. The labels
              are collision-resolved, so each is an unambiguous target. */}
          {timeItems.map((item) => (
            <Point
              key={`${item.key}_dot`}
              $top={item.naturalY}
              $type={pointType}
              $highlighted={item.highlighted}
              title={item.timeDisplay}
            />
          ))}
        </AxisArea>

        <LabelArea>
          <WidthAnchor aria-hidden $card={!!cards}>
            {cards ? (
              <CardBody
                time="00:00:00"
                mapLink={
                  anchorLink && (
                    <CardRow label={anchorLink.title}>
                      <MapIcon sx={{ fontSize: LABEL_ICON_SIZE }} />
                    </CardRow>
                  )
                }
                details={cards.widest}
              />
            ) : (
              <>
                00:00:00
                {linkFor && <MapIcon sx={{ fontSize: LABEL_ICON_SIZE }} />}
              </>
            )}
          </WidthAnchor>
          {timeItems.map((item, index) => {
            const link = item.link
            const icon = link && (
              <MuiLink
                component={Link}
                to={link.to}
                reloadDocument
                aria-label={link.title}
                sx={{ display: 'inline-flex' }}>
                <MapIcon sx={{ fontSize: LABEL_ICON_SIZE }} />
              </MuiLink>
            )
            // On a card the row's own label already names the destination, so a tooltip
            // would only repeat it.
            const mapLink =
              link &&
              (cards ? (
                <CardRow label={link.title}>{icon}</CardRow>
              ) : (
                <Tooltip title={link.title}>{icon!}</Tooltip>
              ))
            return (
              <Label
                key={`${item.key}_label`}
                $top={resolvedYs[index]}
                $highlighted={item.highlighted}
                $card={!!cards}
                // A linked label leaves this off: the icon's tooltip is the only one wanted,
                // and a native title here would surface a second one behind it.
                title={item.link ? undefined : item.timeDisplay}>
                {cards ? (
                  <CardBody time={item.timeDisplay} mapLink={mapLink} details={item.details} />
                ) : (
                  <>
                    {item.timeDisplay}
                    {mapLink}
                  </>
                )}
              </Label>
            )
          })}
          {markItems.map((item, index) => (
            <AbsentMark
              key={item.key}
              $top={resolvedYs[timeItems.length + index]}
              $highlighted={item.highlighted}
              title={absentLabel}
              aria-label={absentLabel}>
              <AbsentIcon fontSize="inherit" />
            </AbsentMark>
          ))}
        </LabelArea>
      </Container>
    </Wrapper>
  )
}

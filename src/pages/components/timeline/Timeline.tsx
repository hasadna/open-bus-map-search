import {
  GtfsRideStopWithRelatedPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { Map as MapIcon } from '@mui/icons-material'
import { Box, Link as MuiLink, Tooltip } from '@mui/material'
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import styled, { css } from 'styled-components'
import dayjs from 'src/dayjs'
import { Coordinates } from 'src/model/location'
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
import {
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

const Line = styled.div<{ totalHeight: number }>`
  height: ${({ totalHeight }) => totalHeight + PADDING * 3}px;
  width: 2px;
  background-color: ${NEUTRAL_COLOR};
`

const BoundaryTick = styled.div.withConfig({ componentId: 'sc-boundary-tick' })<{ top: number }>`
  width: 12px;
  height: 2px;
  background-color: ${NEUTRAL_COLOR};
  position: absolute;
  top: ${({ top }) => top}px;
  right: -5px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Title = styled.span<{ pointType: PointType }>`
  font-weight: bold;
  background-color: ${({ pointType }) => pointTypeToColor[pointType]};
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

/* A card is left transparent on purpose: the horizontal hover line that ties the two
   columns together runs behind the labels, and a filled card would blank it out. */
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
      padding: ${CARD_PADDING_Y}px ${CARD_PADDING_X}px;
      border: 1px solid ${$highlighted ? 'var(--timeline-highlight-ring, #333)' : NEUTRAL_COLOR};
      border-radius: 4px;
      transition: border-color 0.15s ease;
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

function resolveCollisions(ys: number[], labelHeight: number, maxY: number): number[] {
  if (ys.length <= 1) return ys.map((y) => Math.min(y, maxY))
  const minSpacing = labelHeight + LABEL_GAP
  const indexed = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  for (let j = 1; j < indexed.length; j++) {
    const minY = indexed[j - 1].y + minSpacing
    if (indexed[j].y < minY) indexed[j] = { ...indexed[j], y: minY }
  }
  // A label hangs below the point it names, so the lowest one would otherwise run off the
  // end of the axis. Pull it back on and let the upward pass carry that through the rest.
  const last = indexed.length - 1
  if (indexed[last].y > maxY) indexed[last] = { ...indexed[last], y: maxY }
  for (let j = indexed.length - 2; j >= 0; j--) {
    const maxY = indexed[j + 1].y - minSpacing
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
    <Title pointType={pointType} className={className}>
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
  timestamps:
    | GtfsRideStopWithRelatedPydanticModel[]
    | (SiriVehicleLocationWithRelatedPydanticModel & Coordinates)[]
    | Date[]
  totalHeight: number
  pointType: PointType
  timestampToTop: (timestamp: dayjs.Dayjs) => number
  hoveredTimestamp?: string
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
  hoveredTimestamp,
  linkFor,
  cards,
}: TimelineProps) => {
  const { i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  const items = timestamps.map((timestamp, i) => {
    const t =
      (timestamp as GtfsRideStopWithRelatedPydanticModel).arrivalTime ??
      (timestamp as SiriVehicleLocationWithRelatedPydanticModel & Coordinates).recordedAtTime! ??
      (timestamp as Date)
    const tsKey = dayjs(t).toISOString()
    const naturalY = timestampToTop(dayjs(t))
    const highlighted = hoveredTimestamp !== undefined && tsKey === hoveredTimestamp
    const timeDisplay = dayjs(t).format('HH:mm:ss')
    return {
      i,
      tsKey,
      naturalY,
      highlighted,
      timeDisplay,
      link: linkFor?.(i),
      details: cards?.content?.[i],
    }
  })

  // Every link in a column shares one title, so the first stands in for all of them when
  // reserving the column's width.
  const anchorLink = linkFor?.(0)

  const labelHeight = cards?.height ?? LABEL_HEIGHT
  // Label boxes start at `top - POINT_SIZE + 1` (see Label), so this is the last y whose box
  // still ends on the axis.
  const lowestLabelY = totalHeight + PADDING * 3 + POINT_SIZE - 1 - labelHeight
  const resolvedYs = resolveCollisions(
    items.map((item) => item.naturalY),
    labelHeight,
    lowestLabelY,
  )

  return (
    <Wrapper className={className}>
      <Container>
        <AxisArea>
          <Line totalHeight={totalHeight} />
          <BoundaryTick top={-1} />
          <BoundaryTick top={totalHeight + PADDING * 3 - 1} />

          <ConnectorSvg>
            {/* Every label gets one, displaced or not: a card sits well clear of its axis,
                so even an undisplaced one reads as unattached without a leader line. */}
            {items.map((item) => {
              const resolvedY = resolvedYs[item.i]
              const dotY = item.naturalY + POINT_SIZE / 2
              const labelY = resolvedY - POINT_SIZE + 1 + labelHeight / 2
              const color = item.highlighted ? pointTypeToColor[pointType] : NEUTRAL_COLOR
              const opacity = item.highlighted ? 1 : 0.8
              const labelEdgeX = isRtl ? -LABEL_OFFSET : 2 + LABEL_OFFSET
              const horizEndX = isRtl ? labelEdgeX + CONNECTOR_HORIZ : labelEdgeX - CONNECTOR_HORIZ
              return (
                <path
                  key={`${item.i}_conn`}
                  d={`M ${labelEdgeX} ${labelY} L ${horizEndX} ${labelY} L ${DOT_CENTER_X} ${dotY}`}
                  stroke={color}
                  strokeWidth={1}
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
          {items.map((item) => (
            <Point
              key={`${item.i}_dot`}
              top={item.naturalY}
              type={pointType}
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
          {items.map((item) => {
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
                key={`${item.i}_label`}
                $top={resolvedYs[item.i]}
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
        </LabelArea>
      </Container>
    </Wrapper>
  )
}

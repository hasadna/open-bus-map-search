import CloseIcon from '@mui/icons-material/Close'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { Link as MuiLink } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import styled from 'styled-components'
import dayjs from 'src/dayjs'
import { PADDING } from 'src/pages/components/timeline/TimelineBoard'
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

const LABEL_HEIGHT = 18
const LABEL_GAP = 3
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

const WidthAnchor = styled.span`
  display: block;
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;
`

const Label = styled.div<{ $top: number; $highlighted?: boolean }>`
  position: absolute;
  top: ${({ $top }) => $top - POINT_SIZE + 1}px;
  inset-inline-start: 0;
  z-index: 2;
  white-space: nowrap;
  font-weight: ${({ $highlighted }) => ($highlighted ? 'bold' : 'normal')};
`

const ConnectorSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  pointer-events: none;
  overflow: visible;
`

/** Stands in for a dot that never came, in the label lane at the y of the dot the ride
 *  does have on the other axis. A filled disc, so it reads over a band fill. */
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
  background-color: var(--timeline-surface, #fff);
  border: 1px solid rgb(var(--timeline-late) / 60%);
  color: ${ABSENT_COLOR};
  transform: ${({ $highlighted }) => ($highlighted ? 'scale(1.2)' : 'scale(1)')};
  transition: transform 0.15s ease;
  z-index: 3;

  svg {
    font-size: ${ABSENT_MARK_SIZE - 6}px;
  }
`

/**
 * Nudges labels apart so none covers another, then lets the connectors show where each
 * really belongs. Boxes share a top edge, so two are clear of each other once they sit
 * the upper one's own height apart — which is why the gap is read off the earlier item.
 */
function resolveCollisions(ys: number[], heights: number[]): number[] {
  if (ys.length <= 1) return [...ys]
  const indexed = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  const spacingAfter = (j: number) => heights[indexed[j].i] + LABEL_GAP
  for (let j = 1; j < indexed.length; j++) {
    const minY = indexed[j - 1].y + spacingAfter(j - 1)
    if (indexed[j].y < minY) indexed[j] = { ...indexed[j], y: minY }
  }
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
  timestamps: TimelineHit[]
  totalHeight: number
  pointType: PointType
  timestampToTop: (timestamp: dayjs.Dayjs) => number
  /** Which band each timestamp belongs to — parallel to `timestamps`. Both columns share a
   *  band key when their rides share a scheduled departure, which is what pairs them. */
  bandKeys?: string[]
  hoveredBand?: string
  /** Rides whose counterpart is missing from THIS column, at the y of the dot they do have. */
  absentMarks?: { key: string; top: number }[]
  linkFor?: (index: number) => TimelineLink | undefined
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
}: TimelineProps) => {
  const { i18n, t } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  // A cross on the actual column means the ride never reported; a question mark on the
  // planned column means it ran with no schedule to compare against.
  const isActualColumn = pointType === PointType.SIRI
  const AbsentIcon = isActualColumn ? CloseIcon : QuestionMarkIcon
  const absentLabel = t(isActualColumn ? 'timeline_no_actual_ride' : 'timeline_unscheduled_ride')

  // Times and absent markers share the label lane, so they are laid out as one list —
  // a marker that dodged only the other markers could still land on a time.
  const timeItems = timestamps.map((timestamp, i) => {
    const t = hitTime(timestamp)
    const naturalY = timestampToTop(dayjs(t))
    const highlighted = hoveredBand !== undefined && bandKeys?.[i] === hoveredBand
    return {
      key: `time_${i}`,
      naturalY,
      height: LABEL_HEIGHT,
      absent: false,
      highlighted,
      timeDisplay: dayjs(t).format('HH:mm:ss'),
      link: linkFor?.(i),
    }
  })

  const markItems = (absentMarks ?? []).map((mark) => ({
    key: `absent_${mark.key}`,
    naturalY: mark.top,
    height: ABSENT_MARK_SIZE,
    absent: true,
    highlighted: hoveredBand === mark.key,
  }))

  const items = [...timeItems, ...markItems]
  const resolvedYs = resolveCollisions(
    items.map((item) => item.naturalY),
    items.map((item) => item.height),
  )

  return (
    <Wrapper className={className}>
      <Container>
        <AxisArea>
          <Line totalHeight={totalHeight} />
          <BoundaryTick top={-1} />
          <BoundaryTick top={totalHeight + PADDING * 3 - 1} />

          <ConnectorSvg>
            {items.map((item, index) => {
              const resolvedY = resolvedYs[index]
              const { absent } = item
              // A marker has no dot of its own, so its leader line is the only thing naming
              // the instant it belongs to — draw it even when nothing pushed it aside.
              if (!absent && Math.abs(resolvedY - item.naturalY) < 1) return null
              const axisY = instantY(item.naturalY)
              const labelY = resolvedY - POINT_SIZE + 1 + item.height / 2
              const color = absent
                ? ABSENT_COLOR
                : item.highlighted
                  ? pointTypeToColor[pointType]
                  : NEUTRAL_COLOR
              const opacity = item.highlighted ? 0.9 : absent ? 0.7 : 0.5
              const labelEdgeX = isRtl ? -LABEL_OFFSET : 2 + LABEL_OFFSET
              const horizEndX = isRtl ? labelEdgeX + CONNECTOR_HORIZ : labelEdgeX - CONNECTOR_HORIZ
              return (
                <path
                  key={`${item.key}_conn`}
                  d={`M ${labelEdgeX} ${labelY} L ${horizEndX} ${labelY} L ${DOT_CENTER_X} ${axisY}`}
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
          {timeItems.map((item) => (
            <Point
              key={`${item.key}_dot`}
              top={item.naturalY}
              type={pointType}
              $highlighted={item.highlighted}
              title={item.timeDisplay}
            />
          ))}
        </AxisArea>

        <LabelArea>
          <WidthAnchor aria-hidden>00:00:00</WidthAnchor>
          {timeItems.map((item, index) => (
            <Label
              key={`${item.key}_label`}
              $top={resolvedYs[index]}
              $highlighted={item.highlighted}
              title={item.link ? undefined : item.timeDisplay}>
              {item.link ? (
                <MuiLink
                  component={Link}
                  to={item.link.to}
                  reloadDocument
                  title={item.link.title}
                  underline="hover"
                  color="inherit"
                  sx={{ cursor: 'pointer' }}>
                  {item.timeDisplay}
                </MuiLink>
              ) : (
                item.timeDisplay
              )}
            </Label>
          ))}
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

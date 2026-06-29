import {
  GtfsRideStopWithRelatedPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import dayjs, { formatInstant } from 'src/dayjs'
import { Coordinates } from 'src/model/location'
import { PADDING } from 'src/pages/components/timeline/TimelineBoard'
import {
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

function resolveCollisions(ys: number[]): number[] {
  if (ys.length <= 1) return [...ys]
  const minSpacing = LABEL_HEIGHT + LABEL_GAP
  const indexed = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  for (let j = 1; j < indexed.length; j++) {
    const minY = indexed[j - 1].y + minSpacing
    if (indexed[j].y < minY) indexed[j] = { ...indexed[j], y: minY }
  }
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
}

export const Timeline = ({
  className,
  timestamps,
  totalHeight,
  pointType,
  timestampToTop,
  hoveredTimestamp,
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
    const timeDisplay = formatInstant(t, 'HH:mm:ss')
    return { i, tsKey, naturalY, highlighted, timeDisplay }
  })

  const resolvedYs = resolveCollisions(items.map((item) => item.naturalY))

  return (
    <Wrapper className={className}>
      <Container>
        <AxisArea>
          <Line totalHeight={totalHeight} />
          <BoundaryTick top={-1} />
          <BoundaryTick top={totalHeight + PADDING * 3 - 1} />

          <ConnectorSvg>
            {items.map((item) => {
              const resolvedY = resolvedYs[item.i]
              if (Math.abs(resolvedY - item.naturalY) < 1) return null
              const dotY = item.naturalY + POINT_SIZE / 2
              const labelY = resolvedY - POINT_SIZE + 1 + LABEL_HEIGHT / 2
              const color = item.highlighted ? pointTypeToColor[pointType] : NEUTRAL_COLOR
              const opacity = item.highlighted ? 0.9 : 0.5
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
          <WidthAnchor aria-hidden>00:00:00</WidthAnchor>
          {items.map((item) => (
            <Label
              key={`${item.i}_label`}
              $top={resolvedYs[item.i]}
              $highlighted={item.highlighted}
              title={item.timeDisplay}>
              {item.timeDisplay}
            </Label>
          ))}
        </LabelArea>
      </Container>
    </Wrapper>
  )
}

import React, { useCallback } from 'react'
import moment, { Moment } from 'moment'
import styled from 'styled-components'
import {
  LabeledPoint,
  NEUTRAL_COLOR,
  Point,
  POINT_SIZE,
  PointType,
  pointTypeToColor,
  pointTypeToDescription,
} from 'src/pages/components/TimelinePoint'

const PADDING = 10

const Line = styled.div<{ totalHeight: number }>`
  height: ${({ totalHeight }) => totalHeight + PADDING * 3}px;
  width: 2px;
  background-color: ${NEUTRAL_COLOR};
`

const Container = styled.div`
  position: relative;
`

const Title = styled.span<{ pointType: PointType }>`
  position: absolute;
  top: -32px;
  right: 16px;
  font-weight: bold;
  background-color: ${({ pointType }) => pointTypeToColor[pointType]};
  padding: 0 8px;
`

type TimelineProps = {
  className?: string
  timestamps: Date[]
  lowerBound: Date
  totalHeight: number
  totalRange: number
  pointType: PointType
}

export const Timeline = ({
  className,
  timestamps,
  lowerBound,
  totalHeight,
  totalRange,
  pointType,
}: TimelineProps) => {
  const timestampTop = useCallback(
    (timestamp: Moment) => {
      const deltaFromTop = timestamp.diff(lowerBound, 'seconds')
      const portionOfHeight = deltaFromTop / totalRange
      return PADDING + portionOfHeight * totalHeight
    },
    [lowerBound, totalRange, totalHeight],
  )

  return (
    <Container className={className}>
      <Title pointType={pointType}>{pointTypeToDescription[pointType]}</Title>
      <Line totalHeight={totalHeight} />
      <Point top={-POINT_SIZE} />
      <Point top={2 * PADDING + totalHeight + POINT_SIZE} />
      {timestamps.map((timestamp) => (
        <LabeledPoint
          key={timestamp.toString()}
          top={timestampTop(moment(timestamp))}
          type={pointType}
          timestamp={moment(timestamp)}
        />
      ))}
    </Container>
  )
}

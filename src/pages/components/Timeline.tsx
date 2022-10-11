import React from 'react'
import moment, { Moment } from 'moment'
import styled from 'styled-components'
import { TEXTS } from 'src/resources/texts'
import { MAX_HITS_COUNT } from 'src/api/gtfsService'

const PADDING = 10
const DOT_SIZE = 8
const NEUTRAL_COLOR = '#7393B3'
const TARGET_COLOR = '#d3f261'
const GTFS_COLOR = '#69c0ff'
const SIRI_COLOR = '#ff85c0'

enum PointType {
  BOUNDARY,
  GTFS,
  SIRI,
  TARGET,
}

const pointTypeToColor: Record<PointType, string> = {
  [PointType.BOUNDARY]: NEUTRAL_COLOR,
  [PointType.GTFS]: GTFS_COLOR,
  [PointType.SIRI]: SIRI_COLOR,
  [PointType.TARGET]: TARGET_COLOR,
}

const pointTypeToDescription: Record<PointType, string | null> = {
  [PointType.BOUNDARY]: null,
  [PointType.GTFS]: TEXTS.timestamp_gtfs,
  [PointType.SIRI]: TEXTS.timestamp_siri,
  [PointType.TARGET]: TEXTS.timestamp_target,
}

type DotProps = {
  top: number
  type?: PointType
}

const Dot = styled.div<DotProps>`
  height: ${DOT_SIZE}px;
  width: ${DOT_SIZE}px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px ${NEUTRAL_COLOR};
  background-color: ${({ type }) => pointTypeToColor[type || PointType.BOUNDARY]};
  position: absolute;
  top: ${({ top }) => top}px;
  right: -3px;
`

const Label = styled.div<DotProps>`
  position: absolute;
  top: ${({ top }) => top - DOT_SIZE + 1}px;
  right: ${DOT_SIZE * 2}px;
`

type LabeledDotProps = {
  timestamp: Moment
} & DotProps

const LabeledDot = ({ timestamp, top, type }: LabeledDotProps) => {
  const timeDisplay = timestamp.format(TEXTS.datetime_format)
  const description = pointTypeToDescription[type || PointType.BOUNDARY]
  return (
    <>
      <Dot top={top} type={type} title={timeDisplay} />
      <Label top={top} title={timeDisplay}>
        {timeDisplay}
        {description ? ' · ' : ''}
        <b>{description || ''}</b>
      </Label>
    </>
  )
}

const Line = styled.div<{ totalHeight: number }>`
  height: ${({ totalHeight }) => totalHeight + PADDING * 3}px;
  width: 2px;
  background-color: ${NEUTRAL_COLOR};
`

const Container = styled.div`
  position: relative;
`

type TimelineProps = {
  className?: string
  target: Moment
  gtfsTimes: Date[]
}

export const Timeline = ({ className, target, gtfsTimes }: TimelineProps) => {
  const hitCount = gtfsTimes.length
  const totalRange =
    gtfsTimes.length > 0 ? moment(gtfsTimes[hitCount - 1]).diff(gtfsTimes[0], 'seconds') : 0
  const totalHeight = 400 + (gtfsTimes.length / MAX_HITS_COUNT) * 400

  const timestampTop = (timestamp: Moment) => {
    const deltaFromTop = timestamp.diff(gtfsTimes[0], 'seconds')
    const portionOfHeight = deltaFromTop / totalRange
    return PADDING + portionOfHeight * totalHeight
  }

  return (
    <Container className={className}>
      <Line totalHeight={totalHeight} />
      <Dot top={-DOT_SIZE} />
      <Dot top={2 * PADDING + totalHeight + DOT_SIZE} />
      <LabeledDot top={timestampTop(target)} type={PointType.TARGET} timestamp={target} />
      {gtfsTimes.map((timestamp) => (
        <LabeledDot
          key={timestamp.toString()}
          top={timestampTop(moment(timestamp))}
          type={PointType.GTFS}
          timestamp={moment(timestamp)}
        />
      ))}
    </Container>
  )
}

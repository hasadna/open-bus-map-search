import { t } from 'i18next'
import styled from 'styled-components'
import { Moment } from 'moment'

export const POINT_SIZE = 8

export const NEUTRAL_COLOR = '#7393B3'
const TARGET_COLOR = '#d3f261'
const GTFS_COLOR = '#69c0ff'
const SIRI_COLOR = '#ff85c0'

export enum PointType {
  BOUNDARY,
  GTFS,
  SIRI,
  TARGET,
}

export const pointTypeToColor: Record<PointType, string> = {
  [PointType.BOUNDARY]: NEUTRAL_COLOR,
  [PointType.GTFS]: GTFS_COLOR,
  [PointType.SIRI]: SIRI_COLOR,
  [PointType.TARGET]: TARGET_COLOR,
}

export const pointTypeToDescription: Record<PointType, string | null> = {
  [PointType.BOUNDARY]: null,
  [PointType.GTFS]: t('timestamp_gtfs'),
  [PointType.SIRI]: t('timestamp_siri'),
  [PointType.TARGET]: t('timestamp_target'),
}

type PointProps = {
  top: number
  type?: PointType
}

export const Point = styled.div<PointProps>`
  height: ${POINT_SIZE}px;
  width: ${POINT_SIZE}px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px ${NEUTRAL_COLOR};
  background-color: ${({ type }) => pointTypeToColor[type || PointType.BOUNDARY]};
  position: absolute;
  top: ${({ top }) => top}px;
  right: -3px;
`

const Label = styled.div<PointProps>`
  position: absolute;
  top: ${({ top }) => top - POINT_SIZE + 1}px;
  right: ${POINT_SIZE * 2}px;
  z-index: 2;
`

type LabeledPointProps = {
  timestamp: Moment
} & PointProps

export const LabeledPoint = ({ timestamp, top, type }: LabeledPointProps) => {
  const timeDisplay = timestamp.format('HH:mm:ss')
  return (
    <>
      <Point top={top} type={type} title={timeDisplay} />
      <Label top={top} title={timeDisplay}>
        {timeDisplay}
      </Label>
    </>
  )
}

import styled from 'styled-components'

export const POINT_SIZE = 8

export const NEUTRAL_COLOR = 'var(--timeline-neutral, #7393B3)'
const GTFS_COLOR = '#1890ff'
const SIRI_COLOR = '#eb2f96'

export enum PointType {
  BOUNDARY,
  GTFS,
  SIRI,
}

export const pointTypeToColor: Record<PointType, string> = {
  [PointType.BOUNDARY]: NEUTRAL_COLOR,
  [PointType.GTFS]: GTFS_COLOR,
  [PointType.SIRI]: SIRI_COLOR,
}

export const pointTypeToDescription = {
  [PointType.BOUNDARY]: null,
  [PointType.GTFS]: 'timestamp_gtfs',
  [PointType.SIRI]: 'timestamp_siri',
} as const

type PointProps = {
  top: number
  type?: PointType
  $highlighted?: boolean
}

export const Point = styled.div<PointProps>`
  height: ${POINT_SIZE}px;
  width: ${POINT_SIZE}px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px
    ${({ $highlighted, type }) =>
      $highlighted ? pointTypeToColor[type ?? PointType.BOUNDARY] : NEUTRAL_COLOR};
  background-color: ${({ type }) => pointTypeToColor[type || PointType.BOUNDARY]};
  position: absolute;
  top: ${({ top }) => top}px;
  right: -3px;
  transform: ${({ $highlighted }) => ($highlighted ? 'scale(1.5)' : 'scale(1)')};
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  z-index: ${({ $highlighted }) => ($highlighted ? 4 : 2)};
`

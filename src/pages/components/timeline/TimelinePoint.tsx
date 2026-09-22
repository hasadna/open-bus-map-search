import { styled } from '@mui/material/styles'

export const POINT_SIZE = 8

export const ABSENT_MARK_SIZE = 22
export const ABSENT_COLOR = 'rgb(var(--timeline-late))'

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
  $top: number
  $type?: PointType
  $highlighted?: boolean
}

export const Point = styled('div')<PointProps>(({ $top, $type, $highlighted }) => ({
  height: `${POINT_SIZE}px`,
  width: `${POINT_SIZE}px`,
  borderRadius: '50%',
  boxShadow: `0 0 0 2px ${$highlighted ? 'var(--timeline-highlight-ring, white)' : NEUTRAL_COLOR}`,
  backgroundColor: pointTypeToColor[$type || PointType.BOUNDARY],
  position: 'absolute',
  top: `${$top}px`,
  // The dot is wider than the 2px axis it marks, so an equal overhang on one side centres
  // it on the other too — which is what keeps it centred once RTL mirrors this to `left`.
  right: '-3px',
  transform: $highlighted ? 'scale(2)' : 'scale(1)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  zIndex: $highlighted ? 4 : 2,
}))

import moment, { Moment } from 'moment'
import styled from 'styled-components'
import {
  GtfsRideStopPydanticModel,
  SiriVehicleLocationWithRelatedPydanticModel,
} from 'open-bus-stride-client'
import { useTranslation } from 'react-i18next'
import {
  LabeledPoint,
  NEUTRAL_COLOR,
  Point,
  POINT_SIZE,
  PointType,
  pointTypeToColor,
  pointTypeToDescription,
} from 'src/pages/components/timeline/TimelinePoint'
import { PADDING } from 'src/pages/components/timeline/TimelineBoard'
import { Coordinates } from 'src/model/location'

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
  white-space: nowrap;
`

type TimelineProps = {
  className?: string
  // timestamps can be both siri and gtfs timestamps
  timestamps:
    | GtfsRideStopPydanticModel[]
    | (SiriVehicleLocationWithRelatedPydanticModel & Coordinates)[]
    | Date[]
  totalHeight: number
  pointType: PointType
  timestampToTop: (timestamp: Moment) => number
}

export const Timeline = ({
  className,
  timestamps,
  totalHeight,
  pointType,
  timestampToTop,
}: TimelineProps) => {
  const { t } = useTranslation()
  return (
    <Container className={className}>
      <Title pointType={pointType}>{t(pointTypeToDescription[pointType]!)}</Title>
      <Line totalHeight={totalHeight} />
      <Point top={-POINT_SIZE} />
      <Point top={2 * PADDING + totalHeight + POINT_SIZE} />
      {timestamps.map((timestamp) => {
        const t =
          (timestamp as GtfsRideStopPydanticModel).arrivalTime ??
          (timestamp as SiriVehicleLocationWithRelatedPydanticModel & Coordinates)
            .recordedAtTime! ??
          (timestamp as Date)

        return (
          <LabeledPoint
            key={t.toString()}
            top={timestampToTop(moment(t))}
            type={pointType}
            timestamp={moment(t)}
          />
        )
      })}
    </Container>
  )
}

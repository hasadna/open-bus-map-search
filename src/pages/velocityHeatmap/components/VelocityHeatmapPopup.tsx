import type { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import React from 'react'
import { InfoItem, InfoTable } from 'src/pages/components/InfoTable'

export const VelocityHeatmapPopup: React.FC<{
  point: SiriVelocityAggregationPydanticModel
  color: string
  value: number
  minV: number
  maxV: number
}> = ({ point, color, value, minV, maxV }) => (
  <div dir="ltr">
    <InfoTable>
      <InfoItem label="AvgV" value={`${point.averageRollingAvg?.toFixed(1)}km/h`} />
      <InfoItem label="Minv" value={minV} />
      <InfoItem label="MaxV" value={maxV} />
      <InfoItem label="Stddev" value={point.stddevRollingAvg?.toFixed(1)} />
      <InfoItem label="Samples" value={point.totalSampleCount} />
      <InfoItem label="Postion" value={`[${point.roundedLat}, ${point.roundedLon}]`} />
      <InfoItem label="Color" value={color} />
      <InfoItem label="Value" value={value} />
    </InfoTable>
  </div>
)

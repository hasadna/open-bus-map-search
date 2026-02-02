import type { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import React from 'react'
import { InfoItem, InfoTable } from 'src/pages/components/InfoTable'

export const VelocityHeatmapPopup: React.FC<{
  point: SiriVelocityAggregationPydanticModel
  color: string
  minV: number
  maxV: number
}> = ({ point, color, minV, maxV }) => (
  <div dir="ltr">
    <InfoTable>
      <InfoItem label="AvgV" value={`${point.averageRollingAvg?.toFixed(1)} km/h`} />
      <InfoItem label="MinV" value={`${minV?.toFixed(1)} km/h`} />
      <InfoItem label="MaxV" value={`${maxV?.toFixed(1)} km/h`} />
      <InfoItem label="Stddev" value={point.stddevRollingAvg?.toFixed(1)} />
      <InfoItem label="Samples" value={point.totalSampleCount} />
      <InfoItem label="Postion" value={`{ Lat: ${point.roundedLat}, Lon: ${point.roundedLon}}`} />
      <InfoItem label="Color" value={color} />
    </InfoTable>
  </div>
)

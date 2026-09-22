import type { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { InfoItem, InfoTable } from 'src/pages/components/InfoTable'

export const VelocityHeatmapPopup: React.FC<{
  point: SiriVelocityAggregationPydanticModel
  color: string
  minV: number
  maxV: number
}> = ({ point, color, minV, maxV }) => {
  const { t } = useTranslation()
  return (
    <div dir="ltr">
      <InfoTable>
        <InfoItem
          label={t('velocity_popup_avg')}
          value={`${point.averageRollingAvg?.toFixed(1)} km/h`}
        />
        <InfoItem label={t('velocity_popup_min')} value={`${minV?.toFixed(1)} km/h`} />
        <InfoItem label={t('velocity_popup_max')} value={`${maxV?.toFixed(1)} km/h`} />
        <InfoItem label={t('velocity_popup_stddev')} value={point.stddevRollingAvg?.toFixed(1)} />
        <InfoItem label={t('velocity_popup_samples')} value={point.totalSampleCount} />
        <InfoItem
          label={t('velocity_popup_position')}
          value={`{ Lat: ${point.roundedLat}, Lon: ${point.roundedLon}}`}
        />
        <InfoItem label={t('velocity_popup_color')} value={color} />
      </InfoTable>
    </div>
  )
}

import React from 'react'
import { VelocityAggregation } from '../useVelocityAggregationData'

export const VelocityHeatmapPopup: React.FC<{ point: VelocityAggregation }> = ({ point }) => (
  <div>
  <b>Avg velocity:</b> {point.average_rolling_avg.toFixed(1)} km/h<br />
  <br />
    <br />
    <b>Stddev:</b> {point.stddev_rolling_avg.toFixed(1)}
    <br />
  <b>Samples:</b> {point.total_sample_count}<br />
  <br />
    <br />
    <br />
    <b>Lat:</b> {point.rounded_lat}, <b>Lon:</b> {point.rounded_lon}
  </div>
)

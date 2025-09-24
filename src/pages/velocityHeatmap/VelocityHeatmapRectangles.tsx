import React from 'react'
import { Popup, Rectangle } from 'react-leaflet'
import { VelocityAggregation } from './useVelocityAggregationData'

// Popup component for a single velocity aggregation point
const VelocityHeatmapPopup: React.FC<{ point: VelocityAggregation }> = ({ point }) => (
  <div>
    <br />
    <b>Avg velocity:</b> {point.average_rolling_avg.toFixed(1)} km/h
    <br />
    <br />
    <b>Stddev:</b> {point.stddev_rolling_avg.toFixed(1)}
    <br />
    <b>Samples:</b> {point.total_sample_count}
    <br />
    <br />
    <br />
    <b>Lat:</b> {point.rounded_lat}, <b>Lon:</b> {point.rounded_lon}
    <br />
  </div>
)

type VisMode = 'avg' | 'std' | 'cv'

function getValue(point: VelocityAggregation, visMode: VisMode): number {
  const { average_rolling_avg: avg, stddev_rolling_avg: stdev } = point
  if (visMode === 'avg') return avg
  if (visMode === 'std') return stdev
  if (visMode === 'cv') {
    return stdev > 0 ? stdev / avg : 0
  }
  return 0
}

function getRedOpacityColor(value: number, minV = 0, maxV = 1): string {
  // Clamp and normalize value to [0,1]
  const norm = Math.max(0, Math.min(1, (value - minV) / (maxV - minV)))
  return `rgba(255,0,0,${norm})`
}

interface VelocityHeatmapRectanglesProps {
  data: VelocityAggregation[]
  visMode: VisMode
}

export const VelocityHeatmapRectangles: React.FC<VelocityHeatmapRectanglesProps> = ({
  data,
  visMode,
}) => {
  const half = 0.005 // for rounding_precision=2

  // Compute min/max for normalization
  let minV = 0,
    maxV = 1
  if (data.length > 0) {
    const values = data
      .map((p) => getValue(p, visMode))
      .filter((v): v is number => typeof v === 'number' && !isNaN(v))
    if (values.length > 0) {
      minV = Math.min(...values)
      maxV = Math.max(...values)
      if (minV === maxV) {
        // Avoid division by zero
        minV = 0
        maxV = minV + 1
      }
    }
  }

  return (
    <>
      {data.map((point, idx) => {
        const bounds: [[number, number], [number, number]] = [
          [point.rounded_lat - half, point.rounded_lon - half],
          [point.rounded_lat + half, point.rounded_lon + half],
        ]
        const value = getValue(point, visMode)
        const color = getRedOpacityColor(value, minV, maxV)
        return (
          <Rectangle
            key={idx}
            bounds={bounds}
            pathOptions={{ color: color, weight: 1, fillColor: color, fillOpacity: 1 }}>
            <Popup>
              <VelocityHeatmapPopup point={point} />
            </Popup>
          </Rectangle>
        )
      })}
    </>
  )
}

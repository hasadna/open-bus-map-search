import React from 'react'
import { Rectangle, Popup } from 'react-leaflet'
import { VelocityAggregation } from './useVelocityAggregationData'

function getColorByVelocity(velocity: number, minV = 0, maxV = 120) {
  const norm = Math.max(
    0,
    Math.min(1, (velocity - minV) / (maxV - minV)),
  )
  let r, g, b
  if (norm < 0.5) {
    // blue to green
    r = 0
    g = Math.round(2 * 255 * norm)
    b = Math.round(255 * (1 - 2 * norm))
  } else {
    // green to red
    r = Math.round(2 * 255 * (norm - 0.5))
    g = Math.round(255 * (1 - 2 * (norm - 0.5)))
    b = 0
  }
  return `rgba(${r},${g},${b},0.5)`
}

export const VelocityHeatmapRectangles: React.FC<{ data: VelocityAggregation[] }> = ({ data }) => {
  const half = 0.005 // for rounding_precision=2
  return (
    <>
      {data.map((point, idx) => {
        const bounds: [[number, number], [number, number]] = [
          [point.rounded_lat - half, point.rounded_lon - half],
          [point.rounded_lat + half, point.rounded_lon + half],
        ]
        const color = getColorByVelocity(point.average_rolling_avg)
        return (
          <Rectangle
            key={idx}
            bounds={bounds}
            pathOptions={{ color: color, weight: 1, fillColor: color, fillOpacity: 0.6 }}
          >
            <Popup>
              <div>
                <b>Avg velocity:</b> {point.average_rolling_avg.toFixed(1)} km/h<br />
                <br />
                <b>Stddev:</b> {point.stddev_rolling_avg}<br />
                <br />
                <b>Samples:</b> {point.total_sample_count}<br />
                <br />
                <b>Lat:</b> {point.rounded_lat}, <b>Lon:</b> {point.rounded_lon}
              </div>
            </Popup>
          </Rectangle>
        )
      })}
    </>
  )
}

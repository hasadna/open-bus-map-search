import React from 'react'
import { VelocityHeatmapRectangles } from './VelocityHeatmapRectangles'
import { VelocityAggregation } from '../useVelocityAggregationData'

export default {
  title: 'VelocityHeatmap/Rectangles',
  component: VelocityHeatmapRectangles,
}

const sampleData: VelocityAggregation[] = [
  {
    rounded_lon: 34.92,
    rounded_lat: 29.56,
    total_sample_count: 8,
    average_rolling_avg: 60.4,
    stddev_rolling_avg: 3.7,
  },
  {
    rounded_lon: 34.93,
    rounded_lat: 29.57,
    total_sample_count: 12,
    average_rolling_avg: 45.2,
    stddev_rolling_avg: 5.1,
  },
  {
    rounded_lon: 34.94,
    rounded_lat: 29.58,
    total_sample_count: 20,
    average_rolling_avg: 10.0,
    stddev_rolling_avg: 1.2,
  },
]

export const Default = () => (
  <div style={{ height: 400, width: 600 }}>
    <svg width="600" height="400" style={{ position: 'absolute', zIndex: 0 }} />
    <VelocityHeatmapRectangles data={sampleData} visMode="avg" />
  </div>
)

export const StdDev = () => (
  <div style={{ height: 400, width: 600 }}>
    <VelocityHeatmapRectangles data={sampleData} visMode="std" />
  </div>
)

export const CoeffOfVar = () => (
  <div style={{ height: 400, width: 600 }}>
    <VelocityHeatmapRectangles data={sampleData} visMode="cv" />
  </div>
)

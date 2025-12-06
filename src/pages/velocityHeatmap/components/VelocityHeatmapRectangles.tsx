import React, { useContext } from 'react'
import { Popup, Rectangle } from 'react-leaflet'
import dayjs from 'src/dayjs'
import { SearchContext } from '../../../model/pageState'
import { useVelocityAggregationData, VelocityAggregation } from '../useVelocityAggregationData'
import { VelocityHeatmapPopup } from './VelocityHeatmapPopup'
import { useZoomLevel } from './ZoomComponent'
import './VelocityHeatmapRectangles.scss'

type VisMode = 'avg' | 'std' | 'cv'

function getValue(point: VelocityAggregation, visMode: VisMode): number {
  if (visMode === 'avg') return point.average_rolling_avg
  if (visMode === 'std') return point.stddev_rolling_avg
  if (visMode === 'cv') {
    return point.stddev_rolling_avg > 0 ? point.stddev_rolling_avg / point.average_rolling_avg : 0
  }
  return 0
}

function getRedOpacityColor(value: number, minV = 0, maxV = 1): string {
  // Clamp and normalize value to [0,1]
  // 0 = fully transparent, 1 = solid red
  if (maxV === minV) return 'rgba(255,0,0,0)'
  const maxOpacity = 0.9
  const norm = Math.max(0, Math.min(1, (value - minV) / (maxV - minV))) * maxOpacity
  // norm = norm ** 2 / maxOpacity ** 2
  return `rgba(255,0,0,${norm})`
}

interface VelocityHeatmapRectanglesProps {
  visMode: VisMode
}

const DEFAULT_BOUNDS = {
  minLat: 29.5,
  maxLat: 33.33,
  minLon: 34.25,
  maxLon: 35.7,
}

export const VelocityHeatmapRectangles: React.FC<
  VelocityHeatmapRectanglesProps & {
    setMinMax?: (min: number, max: number) => void
  }
> = ({ visMode, setMinMax }) => {
  const { search } = useContext(SearchContext)
  const zoom = useZoomLevel()
  const { data, loading, error, currZoom } = useVelocityAggregationData(
    {
      minLat: DEFAULT_BOUNDS.minLat,
      maxLat: DEFAULT_BOUNDS.maxLat,
      minLon: DEFAULT_BOUNDS.minLon,
      maxLon: DEFAULT_BOUNDS.maxLon,
    },
    dayjs(search.timestamp),
    zoom - 6,
  )
  const half = 0.5 / Math.pow(2, currZoom)

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
  // Pass min/max to parent for legend
  React.useEffect(() => {
    if (setMinMax) setMinMax(minV, maxV)
  }, [minV, maxV, setMinMax])

  return (
    <>
      {error || loading ? (
        <div className="err">
          {error ? 'error' : null}
          {loading ? 'loading! ' : null}
        </div>
      ) : null}
      {data.map((point, idx) => {
        const bounds: [[number, number], [number, number]] = [
          [point.rounded_lat - half, point.rounded_lon - half],
          [point.rounded_lat + half, point.rounded_lon + half],
        ]
        const value = getValue(point, visMode)
        const color = getRedOpacityColor(value, minV, maxV)
        // fillOpacity is always 1, alpha is controlled by color's 4th channel
        return (
          <Rectangle
            key={idx}
            bounds={bounds}
            pathOptions={{ weight: 1, fillColor: color, fillOpacity: 1, stroke: false }}>
            <Popup>
              <VelocityHeatmapPopup point={point} />
              {color} <br />
              value {value} <br />
              minv {minV} <br />
              maxv {maxV} <br />
            </Popup>
          </Rectangle>
        )
      })}
    </>
  )
}

import type { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import { useContext, useEffect } from 'react'
import { Popup, Rectangle } from 'react-leaflet'
import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'
import { useStrideLiteSelected } from 'src/hooks/useStrideLiteOptIn'
import { GlobalSearchContext } from 'src/model/globalState'
import { useVelocityAggregationData } from '../useVelocityAggregationData'
import { cellBounds, ISRAEL_BOUNDS, tilesCovering } from '../velocityTiles'
import { VelocityHeatmapPopup } from './VelocityHeatmapPopup'
import { useMapView } from './ZoomComponent'

type VisMode = 'avg' | 'std' | 'cv'

function getValue(point: SiriVelocityAggregationPydanticModel, visMode: VisMode): number {
  const avg = point.averageRollingAvg ?? 0
  const stdev = point.stddevRollingAvg ?? 0
  if (visMode === 'avg') return avg
  if (visMode === 'std') return stdev
  if (visMode === 'cv') {
    return stdev > 0 ? stdev / avg : 0
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
  return `rgba(255,0,0,${norm.toFixed(3)})`
}

interface VelocityHeatmapRectanglesProps {
  visMode: VisMode
  setMinMax?: (min: number, max: number) => void
  setStatus?: (loading: boolean, hasError: boolean) => void
}

export const VelocityHeatmapRectangles = ({
  visMode,
  setMinMax,
  setStatus,
}: VelocityHeatmapRectanglesProps) => {
  const { search } = useContext(GlobalSearchContext)
  const { zoom, bounds: view } = useMapView()
  const precision = zoom - 6
  // A tile costs production a scan of the whole day, as much as the whole country does.
  const tiles = useStrideLiteSelected() ? tilesCovering(view, precision) : [ISRAEL_BOUNDS]
  const { data, loading, error, currZoom } = useVelocityAggregationData(
    tiles,
    dayjs.tz(search.date, ISRAEL_TIMEZONE),
    precision,
  )

  // Compute min/max for normalization
  let minV = 0,
    maxV = 1
  if (data && data.length > 0) {
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
  useEffect(() => {
    setMinMax?.(minV, maxV)
  }, [minV, maxV, setMinMax])

  // Pass loading/error status to parent - a plain element rendered here would
  // be a child of react-leaflet's MapContainer, which only knows how to
  // position actual map layers, so it would never appear on screen.
  useEffect(() => {
    setStatus?.(loading, !!error)
  }, [loading, error, setStatus])

  return (
    <>
      {data.map((point) => {
        const bounds = cellBounds(point, currZoom)
        const value = getValue(point, visMode)
        const color = getRedOpacityColor(value, minV, maxV)
        // fillOpacity is always 1, alpha is controlled by color's 4th channel
        return (
          <Rectangle
            key={`${point.roundedLon},${point.roundedLat}`}
            bounds={bounds}
            pathOptions={{ weight: 1, fillColor: color, fillOpacity: 1, stroke: false }}>
            <Popup>
              <VelocityHeatmapPopup point={point} color={color} minV={minV} maxV={maxV} />
            </Popup>
          </Rectangle>
        )
      })}
    </>
  )
}

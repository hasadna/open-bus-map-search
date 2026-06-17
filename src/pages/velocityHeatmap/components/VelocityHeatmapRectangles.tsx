import type { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Popup, Rectangle } from 'react-leaflet'
import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'
import { GlobalSearchContext } from 'src/model/globalState'
import { useVelocityAggregationData } from '../useVelocityAggregationData'
import { VelocityHeatmapPopup } from './VelocityHeatmapPopup'
import { useZoomLevel } from './ZoomComponent'
import './VelocityHeatmapRectangles.scss'

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
}

const DEFAULT_BOUNDS = {
  minLat: 29.5,
  maxLat: 33.33,
  minLon: 34.25,
  maxLon: 35.7,
}

export const VelocityHeatmapRectangles = ({
  visMode,
  setMinMax,
}: VelocityHeatmapRectanglesProps) => {
  const { t } = useTranslation()
  const { search } = useContext(GlobalSearchContext)
  const zoom = useZoomLevel()
  const { data, loading, error, currZoom } = useVelocityAggregationData(
    {
      minLat: DEFAULT_BOUNDS.minLat,
      maxLat: DEFAULT_BOUNDS.maxLat,
      minLon: DEFAULT_BOUNDS.minLon,
      maxLon: DEFAULT_BOUNDS.maxLon,
    },
    dayjs.tz(search.date, ISRAEL_TIMEZONE),
    zoom - 6,
  )
  const half = 0.5 / Math.pow(2, currZoom)

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

  return (
    <>
      {error || loading ? (
        <div className="err">
          {error ? t('loading_error') : null}
          {loading ? t('loading') : null}
        </div>
      ) : null}
      {data?.map((point, idx) => {
        const bounds: [[number, number], [number, number]] = [
          [point.roundedLat - half, point.roundedLon - half],
          [point.roundedLat + half, point.roundedLon + half],
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
              <VelocityHeatmapPopup point={point} color={color} minV={minV} maxV={maxV} />
            </Popup>
          </Rectangle>
        )
      })}
    </>
  )
}

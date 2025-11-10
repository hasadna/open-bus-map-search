import React from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

interface ZoomComponentProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  roundingPrecision: number
  onRoundingPrecisionChange: (roundingPrecision: number) => void
}

export function useZoomLevel() {
  const map = useMap()
  return map.getZoom()
}

export const ZoomComponent: React.FC<ZoomComponentProps> = ({
  zoom,
  onZoomChange,
  roundingPrecision,
  onRoundingPrecisionChange,
}) => {
  const map = useMapEvents({
    zoomend: () => {
      const newZoom = map.getZoom()
      if (zoom < newZoom) onRoundingPrecisionChange(roundingPrecision + 1)
      else onRoundingPrecisionChange(roundingPrecision - 1)
      onZoomChange(newZoom)
    },
  })

  return null
}

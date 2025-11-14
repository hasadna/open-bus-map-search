import { useState } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'

export function useZoomLevel() {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvent('zoomend', () => {
    setZoom(map.getZoom())
  })
  return zoom
}

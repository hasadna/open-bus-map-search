import { useState } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import type { VelocityAggregationBounds } from '../velocityTiles'

const viewOf = (map: ReturnType<typeof useMap>) => {
  const b = map.getBounds()
  const bounds: VelocityAggregationBounds = {
    minLat: b.getSouth(),
    maxLat: b.getNorth(),
    minLon: b.getWest(),
    maxLon: b.getEast(),
  }
  return { zoom: map.getZoom(), bounds }
}

/** Zoom and visible area, updated once a pan or zoom settles. */
export function useMapView() {
  const map = useMap()
  const [view, setView] = useState(() => viewOf(map))
  useMapEvent('moveend', () => setView(viewOf(map)))
  return view
}

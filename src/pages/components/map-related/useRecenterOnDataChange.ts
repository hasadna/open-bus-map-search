import { LatLngTuple } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import { MapProps } from './map-types'

export function useRecenterOnDataChange({ positions, plannedRouteStops }: MapProps) {
  const map = useMap()

  const center = useMemo(() => {
    const sum: LatLngTuple = [0, 0]
    const totalPoints = positions.length + (plannedRouteStops?.length ?? 0)

    if (totalPoints === 0) return sum

    for (const position of positions) {
      sum[0] += position.loc[0]
      sum[1] += position.loc[1]
    }

    if (plannedRouteStops) {
      for (const stop of plannedRouteStops) {
        sum[0] += stop.location.latitude
        sum[1] += stop.location.longitude
      }
    }
    sum[0] /= totalPoints
    sum[1] /= totalPoints

    return sum
  }, [positions, plannedRouteStops])

  useEffect(() => {
    if (center[0] || center[1]) {
      // No animation: this effect re-fires per streamed position batch, and
      // chained animated pans keep the map (and its markers) drifting long
      // after the data is on screen.
      map.setView(center, map.getZoom(), { animate: false })
    }
  }, [...center, map])
}

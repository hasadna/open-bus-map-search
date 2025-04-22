import { useEffect, useMemo } from 'react'
import { LatLngTuple } from 'leaflet'
import { useMap } from 'react-leaflet'
import { MapProps } from './map-types'

export function useRecenterOnDataChange({ positions, plannedRouteStops }: MapProps) {
  const map = useMap()

  const center = useMemo(() => {
    const sum: LatLngTuple = [0, 0]
    const totalPoints = positions.length + (plannedRouteStops?.length ?? 0);

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
      map.setView(center, map.getZoom(), { animate: true })
    }
  }, [...center, map])
}

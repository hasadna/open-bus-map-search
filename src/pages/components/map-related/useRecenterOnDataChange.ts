import { useEffect, useMemo } from 'react'
import { LatLngTuple } from 'leaflet'
import { useMap } from 'react-leaflet'
import { MapProps } from './map-types'

export function useRecenterOnDataChange({ positions = [], plannedRouteStops = [] }: MapProps) {
  const map = useMap()

  const { center, totalPoints } = useMemo(() => {
    const sum = [0, 0]
    const totalPoints = positions.length + plannedRouteStops.length

    for (const position of positions) {
      sum[0] += position.loc[0]
      sum[1] += position.loc[1]
    }

    for (const stop of plannedRouteStops) {
      sum[0] += stop.location.latitude
      sum[1] += stop.location.longitude
    }

    const center: LatLngTuple = [sum[0] / totalPoints, sum[1] / totalPoints]

    return { center, totalPoints }
  }, [positions, plannedRouteStops])

  useEffect(() => {
    if (totalPoints === 0 || (center[0] === 0 && center[1] === 0)) return

    map.setView(center, map.getZoom(), { animate: true })
  }, [center, totalPoints, map])
}

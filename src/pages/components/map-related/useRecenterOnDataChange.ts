import { useEffect } from 'react'
import { LatLngTuple } from 'leaflet'
import { useMap } from 'react-leaflet'
import { MapProps } from './map-types'

export function useRecenterOnDataChange({ positions = [], plannedRouteStops = [] }: MapProps) {
  const map = useMap()

  useEffect(() => {
    if (!positions.length && !plannedRouteStops.length) return

    const positionsSum = positions.reduce(
      ([lat, lng], pos) => [lat + pos.loc[0], lng + pos.loc[1]],
      [0, 0],
    )
    const stopsSum = plannedRouteStops.reduce(
      ([lat, lng], stop) => [lat + stop.location.latitude, lng + stop.location.longitude],
      [0, 0],
    )

    const totalPoints = positions.length + plannedRouteStops.length

    const mean: LatLngTuple = [
      (positionsSum[0] + stopsSum[0]) / totalPoints,
      (positionsSum[1] + stopsSum[1]) / totalPoints,
    ]

    // console.log('mean: ', mean)
    if (mean[0] || mean[1]) {
      map.setView(mean, map.getZoom(), { animate: true })
    }
  }, [positions, plannedRouteStops, map])
}

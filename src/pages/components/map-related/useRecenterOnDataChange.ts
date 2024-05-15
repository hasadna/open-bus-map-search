import { useEffect } from 'react'
import { LatLngTuple } from 'leaflet'
import { useMap } from 'react-leaflet'
import { MapProps } from './map-types'

export function useRecenterOnDataChange({ positions, plannedRouteStops, position }: MapProps) {
  const map = useMap()
  const positionsSum = positions.reduce(
    (acc, { loc }) => [acc[0] + loc[0], acc[1] + loc[1]],
    [0, 0],
  )
  const mean: LatLngTuple = [
    positionsSum[0] / positions.length || position.loc[0],
    positionsSum[1] / positions.length || position.loc[1],
  ]
  console.log('mean: ', mean)
  useEffect(() => {
    if (mean[0] || mean[1]) {
      map.setView(mean, map.getZoom(), { animate: true })
    }
  }, [positions, plannedRouteStops])
}

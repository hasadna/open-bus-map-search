import { useEffect } from 'react'
import { LatLngTuple } from 'leaflet'
import { useMap } from 'react-leaflet'
import { MapProps, position } from './MapWithLocationsAndPath'

export function useRecenterOnDataChange({ positions, plannedRouteStops }: MapProps) {
  const map = useMap()
  const positionsSum = positions.reduce(
    (acc, { loc }) => [acc[0] + loc[0], acc[1] + loc[1]],
    [0, 0],
  )
  const mean: LatLngTuple = [
    positionsSum[0] / positions.length || position.loc[0],
    positionsSum[1] / positions.length || position.loc[1],
  ]
  useEffect(() => {
    // const positionsSum = positions.reduce(
    //   (acc, { loc }) => [acc[0] + loc[0], acc[1] + loc[1]],
    //   [0, 0],
    // )
    // const mean: LatLngTuple = [
    //   positionsSum[0] / positions.length || position.loc[0],
    //   positionsSum[1] / positions.length || position.loc[1],
    // ]

    map.setView(mean, map.getZoom(), { animate: true })
  }, [positions, plannedRouteStops])
}

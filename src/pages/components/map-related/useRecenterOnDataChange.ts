import { useEffect } from 'react'
import { LatLngTuple } from 'leaflet'
import { useMap } from 'react-leaflet'
import { MapProps } from './map-types'
import { BusStop } from 'src/model/busStop'
import { Point } from 'src/pages/timeBasedMap'

const calculatePoint = (acc: LatLngTuple, curr: Point | BusStop): LatLngTuple => {
  if ('loc' in curr && curr.loc) {
    return [acc[0] + curr.loc[0], acc[1] + curr.loc[1]]
  }
  if ('location' in curr && curr.location) {
    return [acc[0] + curr.location.latitude, acc[1] + curr.location.longitude]
  }
  return acc
}

const calculateMean = (
  positionsSum: LatLngTuple,
  stopsSum: LatLngTuple,
  totalPoints: number,
): LatLngTuple => {
  return [
    (positionsSum[0] + stopsSum[0]) / totalPoints,
    (positionsSum[1] + stopsSum[1]) / totalPoints,
  ]
}

export function useRecenterOnDataChange({ positions = [], plannedRouteStops = [] }: MapProps) {
  const map = useMap()

  useEffect(() => {
    if (positions.length === 0 && plannedRouteStops.length === 0) return

    const positionsSum = positions.reduce(calculatePoint, [0, 0])
    const stopsSum = plannedRouteStops.reduce(calculatePoint, [0, 0])
    const totalPoints = positions.length + plannedRouteStops.length

    if (totalPoints === 0) return

    const mean = calculateMean(positionsSum, stopsSum, totalPoints)

    if (mean[0] !== 0 || mean[1] !== 0) {
      map.setView(mean, map.getZoom(), { animate: true })
    }
  }, [positions, plannedRouteStops, map])
}

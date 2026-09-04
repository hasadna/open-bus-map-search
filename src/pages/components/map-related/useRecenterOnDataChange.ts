import { LatLngTuple } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import { rideBody } from '../utils/gpsIntegrity'
import { MapProps } from './map-types'

export function useRecenterOnDataChange({
  positionGroups,
  plannedRouteStops,
  flagGpsArtifacts,
}: MapProps) {
  const map = useMap()

  const center = useMemo(() => {
    const sum: LatLngTuple = [0, 0]
    const positions = positionGroups.flatMap((g) => g.positions)
    // The centre is a mean, so a single spoofed fix hundreds of kilometres away drags the whole
    // view off the ride. A ride with nothing the vehicle could have driven still has to show
    // what it did report, somewhere.
    const onRoute = flagGpsArtifacts
      ? positionGroups.flatMap((g) => rideBody(g.positions))
      : positions
    const allPositions = onRoute.length ? onRoute : positions
    const totalPoints = allPositions.length + (plannedRouteStops?.length ?? 0)

    if (totalPoints === 0) return sum

    for (const position of allPositions) {
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
  }, [positionGroups, plannedRouteStops, flagGpsArtifacts])

  useEffect(() => {
    if (center[0] || center[1]) {
      // No animation: this effect re-fires per streamed position batch, and
      // chained animated pans keep the map (and its markers) drifting long
      // after the data is on screen.
      map.setView(center, map.getZoom(), { animate: false })
    }
  }, [...center, map])
}

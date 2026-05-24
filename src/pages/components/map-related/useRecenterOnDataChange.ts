import { LatLngTuple } from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { MapProps } from './map-types'

type UseRecenterProps = MapProps & {
  /** When provided, auto-fit only fires when this key changes — not on every
   *  positions update. Pass routeKey+operatorId so returning to the same route
   *  preserves the user's saved viewport. */
  routeIdentity?: string
}

export function useRecenterOnDataChange({
  positions,
  plannedRouteStops,
  routeIdentity,
}: UseRecenterProps) {
  const map = useMap()
  const prevIdentity = useRef<string | undefined>(undefined)

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
    if (!center[0] && !center[1]) return

    // If a routeIdentity is provided, only re-fit when it changes.
    // This preserves the user's panned/zoomed viewport when returning to the
    // same route, while still auto-fitting when they select a different one.
    if (routeIdentity !== undefined) {
      if (routeIdentity === prevIdentity.current) return
      prevIdentity.current = routeIdentity
    }

    map.setView(center, map.getZoom(), { animate: true })
  }, [...center, map, routeIdentity])
}

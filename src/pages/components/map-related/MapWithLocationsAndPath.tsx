import { MapProps } from './map-types'
import type { Point } from './map-types'
import { MapContent } from './MapContent'
import { MapShell } from './MapShell'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

export function MapWithLocationsAndPath({
  positions,
  plannedRouteStops,
  showNavigationButtons,
}: MapProps) {
  return (
    <MapShell center={position.loc} zoom={13} scrollWheelZoom={true}>
      <MapContent
        positions={positions}
        plannedRouteStops={plannedRouteStops}
        showNavigationButtons={showNavigationButtons}
      />
    </MapShell>
  )
}

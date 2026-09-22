import { MapProps } from './map-types'
import type { Point } from './map-types'
import { MapContent } from './MapContent'
import { MapIndexLayer } from './MapLayers/MapIndexLayer'
import { MapShell } from './MapShell'

const position: Point = {
  loc: [32.3057988, 34.85478613], // arbitrary default value... Netanya - best city to live & die in
  color: 0,
}

export function MapWithLocationsAndPath({
  positionGroups,
  plannedRouteStops,
  showNavigationButtons,
  focusTarget,
}: MapProps) {
  return (
    <MapShell
      center={position.loc}
      zoom={13}
      scrollWheelZoom={true}
      legend={
        <MapIndexLayer showPlannedRoute={!!plannedRouteStops} positionGroups={positionGroups} />
      }>
      <MapContent
        positionGroups={positionGroups}
        plannedRouteStops={plannedRouteStops}
        showNavigationButtons={showNavigationButtons}
        focusTarget={focusTarget}
      />
    </MapShell>
  )
}

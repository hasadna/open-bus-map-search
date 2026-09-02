/**
 * Every Leaflet icon and line colour the map draws with, and nothing that renders. Apart from
 * `MapContent` because the layers it renders need these too, which made
 * `MapContent → MapLayers/* → MapContent` an import cycle — `madge --circular` fails CI on it.
 * Keep this module free of component imports.
 */
import { DivIcon, Icon, IconOptions } from 'leaflet'
import {
  arrowSvgMarkup,
  gpsArtifactSvgMarkup,
  rideEndSvgMarkup,
  speedBand,
  standingSvgMarkup,
} from './vehicleBearingGlyph'

const getIcon = (
  path: string,
  width: number = 10,
  height: number = 10,
  className?: string,
): Icon<IconOptions> => {
  return new Icon<IconOptions>({
    iconUrl: path,
    iconSize: [width, height],
    className,
  })
}

/** Carried by every ping shape, so a ping can be selected without knowing which one it got. */
export const vehiclePingMarkerClass = 'vehicle-ping-marker'

/** One box for every speed band and the standing glyph alike, so the click target doesn't shrink
 * with the speed and the icon centres on its ping without per-band anchor arithmetic. */
const PING_ICON_PX = 28

/** The ride-start circle's 30px in `map.scss`, so a ride's two ends are the same size. */
const RIDE_END_ICON_PX = 30

const pingIconOptions = (className: string, html: string, px: number = PING_ICON_PX) => ({
  className: `${vehiclePingMarkerClass} ${className}`,
  iconSize: [px, px] as [number, number],
  html,
})

const bearingMarkers = new Map<string, DivIcon>()
const standingMarkers = new Map<string, DivIcon>()

/** Onto 0-359, the convention SVG `rotate()` shares with SIRI (0 = north, clockwise). */
const normalizeBearing = (bearing: number) => ((Math.round(bearing) % 360) + 360) % 360

/** Cached per whole degree and band, so a ride's hundreds of pings share at most 360 × 6 icons
 * and re-renders hand Leaflet the same object back. */
export const vehicleBearingMarker = (bearing: number, speedKmh: number): DivIcon => {
  const deg = normalizeBearing(bearing)
  const band = speedBand(speedKmh)
  const key = `${deg}-${band}`
  const cached = bearingMarkers.get(key)
  if (cached) return cached

  const icon = new DivIcon(pingIconOptions('vehicle-bearing-marker', arrowSvgMarkup(deg, band)))
  bearingMarkers.set(key, icon)
  return icon
}

export const vehicleStandingMarker = (bearing?: number): DivIcon => {
  const deg = bearing === undefined ? undefined : normalizeBearing(bearing)
  const key = `${deg}`
  const cached = standingMarkers.get(key)
  if (cached) return cached

  const icon = new DivIcon(pingIconOptions('vehicle-standing-marker', standingSvgMarkup(deg)))
  standingMarkers.set(key, icon)
  return icon
}

export const rideEndMarker = new DivIcon(
  pingIconOptions('vehicle-ride-end-marker', rideEndSvgMarkup(), RIDE_END_ICON_PX),
)

export const gpsArtifactMarker = new DivIcon(
  pingIconOptions('vehicle-gps-artifact-marker', gpsArtifactSvgMarkup()),
)

/** Sparse dots for the route as *claimed* — deliberately fainter than the impossible-movement
 * dashes, since none of the positions it joins is real. */
export const claimedRouteDashArray = '1 9'
export const implausibleSegmentDashArray = '9 7'

export const plannedRouteLineColor = 'black'
export const plannedRouteStopMarkerPath = `${import.meta.env.BASE_URL}marker-bus-stop.png`
export const plannedRouteStopMarker = getIcon(plannedRouteStopMarkerPath, 20, 25)

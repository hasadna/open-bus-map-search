/**
 * Every Leaflet icon and line colour the map draws with, and nothing that renders.
 *
 * They live here rather than in `MapContent` because the layers `MapContent` renders need them
 * too: with the definitions in `MapContent`, `MapContent → MapLayers/* → MapContent` was an
 * import cycle (two of them, which `madge --circular` fails CI on). A module of leaf values that
 * imports no component breaks it — the layers and `MapContent` both depend on this, and it
 * depends on neither.
 */
import { DivIcon, Icon, IconOptions } from 'leaflet'
import {
  arrowSvgMarkup,
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

/** Carried by both vehicle-ping shapes (standing ring and bearing arrow) so a ping can be
 * selected without knowing which of the two it got. */
export const vehiclePingMarkerClass = 'vehicle-ping-marker'

/** Leaflet's box for a ping glyph, in px. It stays the same across every speed band and the
 * standing glyph too, so the click target doesn't shrink with the speed and the icon keeps
 * centring on its ping without per-band anchor arithmetic. */
const PING_ICON_PX = 28

/** The ride-end badge gets the ride-start circle's 30px instead, so a ride's two ends are the
 * same size — and its chequer gets the pixels it needs to read as one. */
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

/**
 * Arrow marker pointing where the vehicle was heading, from the ping's SIRI bearing
 * (0 = north, clockwise — the same convention SVG `rotate()` uses), grown by how fast it was
 * travelling and reddened if that was slow (see {@link speedBand}).
 *
 * Instances are cached per whole degree and band, so a ride's hundreds of pings share at most
 * 360 × 4 icons and re-renders reuse the same object.
 */
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

/**
 * Marker for a ping the vehicle reported standing at: the ride-start marker's white disc, with a
 * compass needle inside showing the way it was facing. Nothing else on the map is a disc this
 * size, so the one exact reading the arrows can never carry — velocity 0 — keeps its own shape.
 *
 * A bearing of `undefined` drops the needle rather than inventing a heading.
 */
export const vehicleStandingMarker = (bearing?: number): DivIcon => {
  const deg = bearing === undefined ? undefined : normalizeBearing(bearing)
  const key = `${deg}`
  const cached = standingMarkers.get(key)
  if (cached) return cached

  const icon = new DivIcon(pingIconOptions('vehicle-standing-marker', standingSvgMarkup(deg)))
  standingMarkers.set(key, icon)
  return icon
}

/**
 * Marker for the ride's last ping: a chequered disc, the finish line to the operator's logo at
 * the start. One per ride, so it is built once rather than cached per bearing.
 */
export const rideEndMarker = new DivIcon(
  pingIconOptions('vehicle-ride-end-marker', rideEndSvgMarkup(), RIDE_END_ICON_PX),
)

export const plannedRouteLineColor = 'black'
export const plannedRouteStopMarkerPath = `${import.meta.env.BASE_URL}marker-bus-stop.png`
export const plannedRouteStopMarker = getIcon(plannedRouteStopMarkerPath, 20, 25)

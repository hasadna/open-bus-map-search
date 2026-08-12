/**
 * The vehicle-ping arrow: MUI's `Navigation` glyph, turned to the ping's bearing and sized by
 * how fast the bus was going.
 *
 * It lives apart from `MapContent` so the legend can render it without pulling Leaflet in, and
 * so both renderings — Leaflet's HTML string and the legend's element — come off one path and
 * one transform.
 */

/** MUI's `Navigation` glyph (@mui/icons-material/Navigation), on its native 24x24 viewBox.
 * Inlined rather than imported because Leaflet builds icons from an HTML string, so the React
 * component would mean pulling react-dom/server into the bundle for one arrow. */
export const ARROW_PATH = 'M12 2 4.5 20.29l.71.71L12 18l6.79 3 .71-.71z'

/** Under this speed (km/h) the ride counts as standing and keeps the ring: a parked bus has no
 * direction of travel to point at, and GPS jitter alone drifts a fix by around 0.5 km/h. */
export const STANDING_KMH = 2

/**
 * Upper bound (km/h) of every speed band but the last, which is open-ended. Set against derived
 * segment speeds sampled from 25 live rides, where they split the moving pings 29 / 36 / 23 /
 * 12 percent — so every step of the ramp earns its place.
 */
export const SPEED_BAND_MAX = [10, 20, 35]

/** Bands, slowest (0) to fastest. */
export const SPEED_BANDS = SPEED_BAND_MAX.map((_, band) => band).concat(SPEED_BAND_MAX.length)

/** Which band a speed falls in, from 0 to {@link SPEED_BAND_MAX}.length. */
export function speedBand(kmh: number): number {
  const band = SPEED_BAND_MAX.findIndex((max) => kmh <= max)
  return band === -1 ? SPEED_BAND_MAX.length : band
}

/** A band as its km/h range, e.g. `2-10` or `36+`, for the legend. */
export function speedBandLabel(band: number): string {
  const from = band === 0 ? Math.ceil(STANDING_KMH) : SPEED_BAND_MAX[band - 1] + 1
  return band === SPEED_BAND_MAX.length ? `${from}+` : `${from}-${SPEED_BAND_MAX[band]}`
}

/** What the ring covers: everything below the standing threshold. */
export const STANDING_LABEL = `<${Math.ceil(STANDING_KMH)}`

/** How the arrow grows across the bands, as a factor of the glyph. The top band stays inside
 * the viewBox's inscribed circle, so no bearing clips a corner off the fastest arrow. */
const BAND_SCALE = [0.54, 0.68, 0.82, 0.96]

/**
 * Speed only survives at ~12px if more than the size carries it, so the slow half of the bands
 * is drawn as an outline and the fast half solid — one ramp, stated twice. The colours live in
 * `map.scss` (which lets dark mode swap them); the markup carries geometry alone.
 */
const bandClass = (band: number) =>
  `ping-arrow${band < BAND_SCALE.length / 2 ? ' ping-arrow--outline' : ''}`

const bandTransform = (deg: number, band: number) =>
  `rotate(${deg} 12 12) translate(12 12) scale(${BAND_SCALE[band]}) translate(-12 -12)`

/**
 * The arrow as standalone SVG markup, for Leaflet's `DivIcon` (which builds from an HTML
 * string).
 *
 * The rotation is an SVG *presentation attribute*, deliberately not a `style` attribute:
 * `style-src` in `csp.ts` omits `'unsafe-inline'`, so an inline style would be dropped by the
 * browser and every arrow would render pointing north. Presentation attributes aren't inline
 * CSS and are unaffected.
 */
export const arrowSvgMarkup = (deg: number, band: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  `<path class="${bandClass(band)}" d="${ARROW_PATH}" transform="${bandTransform(deg, band)}"/>` +
  `</svg>`

/** The same arrow as an element, for the legend — where an `<img src="data:…">` would seal the
 * glyph off from the stylesheet that paints it. */
export function VehicleBearingGlyph({ band, bearing = 0 }: { band: number; bearing?: number }) {
  return (
    <svg viewBox="0 0 24 24" className="vehicle-bearing-glyph" aria-hidden>
      <path className={bandClass(band)} d={ARROW_PATH} transform={bandTransform(bearing, band)} />
    </svg>
  )
}

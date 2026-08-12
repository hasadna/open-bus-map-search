/**
 * The vehicle-ping glyphs: an arrow turned to the ping's bearing and sized by how fast the bus
 * was going, a compass badge for a bus reported stationary — which still faces the way the bus
 * did — and the chequered badge that closes the ride off.
 *
 * The two badges borrow the ride-start marker's styling (`.bus-icon-circle`: a white disc
 * holding a dark glyph, in both themes), so the things that bookend or interrupt a ride read as
 * one family and the arrows stay the only bare shapes on the map.
 *
 * They live apart from `MapContent` so the legend can render them without pulling Leaflet in,
 * and so both renderings — Leaflet's HTML string and the legend's element — come off one set of
 * paths and one transform.
 */

/** MUI's `Navigation` glyph (@mui/icons-material/Navigation), on its native 24x24 viewBox.
 * Inlined rather than imported because Leaflet builds icons from an HTML string, so the React
 * component would mean pulling react-dom/server into the bundle for one arrow. */
export const ARROW_PATH = 'M12 2 4.5 20.29l.71.71L12 18l6.79 3 .71-.71z'

/**
 * Standing means the ping's own velocity is *exactly* zero, not merely small: SIRI reports it
 * as a spot reading, so 0 is the vehicle's own statement that it was stationary at that
 * instant, and it is the number the tooltip shows. A tolerance band above it would put pings
 * the data calls moving under the standing glyph, and leave the two disagreeing on screen.
 */
export const isStanding = (kmh: number) => kmh === 0

/**
 * Upper bound (km/h) of every speed band but the last, which is open-ended. Set against a live
 * 3000-ping sample, where they split the moving pings 17 / 31 / 31 / 21 percent — so every step
 * of the ramp earns its place.
 */
export const SPEED_BAND_MAX = [15, 30, 50]

/** Bands, slowest (0) to fastest. */
export const SPEED_BANDS = SPEED_BAND_MAX.map((_, band) => band).concat(SPEED_BAND_MAX.length)

/** Which band a speed falls in, from 0 to {@link SPEED_BAND_MAX}.length. */
export function speedBand(kmh: number): number {
  const band = SPEED_BAND_MAX.findIndex((max) => kmh <= max)
  return band === -1 ? SPEED_BAND_MAX.length : band
}

/** A band as its km/h range, e.g. `1-15` or `51+`, for the legend. */
export function speedBandLabel(band: number): string {
  const from = band === 0 ? 1 : SPEED_BAND_MAX[band - 1] + 1
  return band === SPEED_BAND_MAX.length ? `${from}+` : `${from}-${SPEED_BAND_MAX[band]}`
}

/** What the standing glyph covers — the one exact value the arrows can never take. */
export const STANDING_LABEL = '0'

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

const rotate = (deg: number) => `rotate(${deg} 12 12)`

const bandTransform = (deg: number, band: number) =>
  `${rotate(deg)} translate(12 12) scale(${BAND_SCALE[band]}) translate(-12 -12)`

/**
 * The standing badge: a compass needle inside the ride-start marker's white disc. The disc is
 * the same whichever way the needle turns, so it stays centred on the ping and its silhouette
 * alone says "stopped" — the heading is read off the inside.
 */
const STANDING_DISC = { cx: 12, cy: 12, r: 7.3 }
const STANDING_NEEDLE = 'M12 6 16 16 12 13.9 8 16Z'

/**
 * The chequer that fills the ride-end badge: the finish flag's cloth, wrapped into the same disc
 * the operator's logo gets at the ride's start. A flag on a pole was the first cut, but its
 * cells fall below a pixel at marker size and it stopped reading as chequered at all.
 */
const RIDE_END_DISC = { cx: 12, cy: 12, r: 10.6 }
const RIDE_END_CELLS = 3

/**
 * SVG markup for Leaflet's `DivIcon` (which builds from an HTML string).
 *
 * The rotation is an SVG *presentation attribute*, deliberately not a `style` attribute:
 * `style-src` in `csp.ts` omits `'unsafe-inline'`, so an inline style would be dropped by the
 * browser and every glyph would render pointing north. Presentation attributes aren't inline
 * CSS and are unaffected.
 */
export const arrowSvgMarkup = (deg: number, band: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  `<path class="${bandClass(band)}" d="${ARROW_PATH}" transform="${bandTransform(deg, band)}"/>` +
  `</svg>`

const discMarkup = ({ cx, cy, r }: { cx: number; cy: number; r: number }) =>
  `<circle class="ping-badge" cx="${cx}" cy="${cy}" r="${r}"/>`

/** The standing badge, needle and all. A bearing of `undefined` leaves the needle off rather
 * than inventing a heading — the bare disc then reads as "stopped, facing unknown". */
export const standingSvgMarkup = (deg?: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  discMarkup(STANDING_DISC) +
  (deg === undefined
    ? ''
    : `<path class="ping-badge-mark" d="${STANDING_NEEDLE}" transform="${rotate(deg)}"/>`) +
  `</svg>`

/**
 * The chequer cells, laid over the largest square that fits the badge, alternating from the
 * top-left corner in. Built rather than hand-drawn so the grid stays square if the cell count
 * or the disc changes.
 */
const chequerMarkup = () => {
  const side = RIDE_END_DISC.r * Math.SQRT2
  const cell = side / RIDE_END_CELLS
  const origin = RIDE_END_DISC.cx - side / 2
  const cells = []
  for (let row = 0; row < RIDE_END_CELLS; row++) {
    for (let col = 0; col < RIDE_END_CELLS; col++) {
      if ((row + col) % 2 !== 0) continue
      const x = (origin + col * cell).toFixed(2)
      const y = (origin + row * cell).toFixed(2)
      cells.push(
        `<rect class="ping-badge-mark" x="${x}" y="${y}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`,
      )
    }
  }
  return cells.join('')
}

/**
 * The chequered badge that marks where the ride's last ping was, opposite the operator's logo on
 * its first — a finish line, so it carries no bearing and no speed.
 */
export const rideEndSvgMarkup = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  discMarkup(RIDE_END_DISC) +
  chequerMarkup() +
  `</svg>`

/**
 * Where each glyph sits in the marker stack. Leaflet adds these to the marker's own
 * y-derived z-index, so a step has to outweigh the vertical gap between two markers — but only
 * markers within a few pixels of each other can hide one another in the first place, which
 * 1000 clears many times over.
 *
 * The bookends win outright — they are the two markers you go looking for. Under them the pings
 * stack smallest-first, the inverse of {@link BAND_SCALE}: zoomed out a whole ride collapses
 * into a few pixels, and left to the default order the fast arrows would simply cover the slow
 * ones, which are exactly the pings worth seeing.
 */
export const BOOKEND_Z_INDEX = 10000
export const STANDING_Z_INDEX = 5000
export const bearingZIndex = (band: number) => (SPEED_BANDS.length - band) * 1000

/** The arrow as an element, for the legend — where an `<img src="data:…">` would seal the glyph
 * off from the stylesheet that paints it. */
export function VehicleBearingGlyph({ band, bearing = 0 }: { band: number; bearing?: number }) {
  return (
    <svg viewBox="0 0 24 24" className="vehicle-bearing-glyph" aria-hidden>
      <path className={bandClass(band)} d={ARROW_PATH} transform={bandTransform(bearing, band)} />
    </svg>
  )
}

/** The standing badge as an element, for the legend. */
export function VehicleStandingGlyph({ bearing = 0 }: { bearing?: number }) {
  return (
    <svg viewBox="0 0 24 24" className="vehicle-bearing-glyph" aria-hidden>
      <circle className="ping-badge" {...STANDING_DISC} />
      <path className="ping-badge-mark" d={STANDING_NEEDLE} transform={rotate(bearing)} />
    </svg>
  )
}

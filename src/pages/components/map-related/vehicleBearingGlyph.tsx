/**
 * The vehicle-ping glyphs as plain SVG, free of Leaflet, so the legend renders the same paths
 * and transform as the map without pulling Leaflet in.
 */

/** MUI's `Navigation` glyph (@mui/icons-material/Navigation) on its native 24x24 viewBox.
 * Inlined rather than imported: Leaflet builds icons from an HTML string, so the React component
 * would mean pulling react-dom/server into the bundle for one arrow. */
export const ARROW_PATH = 'M12 2 4.5 20.29l.71.71L12 18l6.79 3 .71-.71z'

/** Exactly zero, with no tolerance band under it: this is the vehicle's own reading and the
 * number the tooltip prints, so the glyph can never say "stopped" over a tooltip saying 3 km/h. */
export const isStanding = (kmh: number) => kmh === 0

/**
 * Upper bound (km/h) of every speed band but the last, which is open-ended. The bounds sit in
 * the gaps of the reporting grid: most fleets' telematics report whole m/s, so 97% of SIRI
 * velocities arrive as round(3.6k) km/h — 4, 7, 11, 14, 18, 22, 25, 29 and so on. A bound *on*
 * one of those would balance a twelfth of all moving pings on the boundary.
 */
export const SPEED_BAND_MAX = [15, 23, 35, 55, 85]

/** Bands, slowest (0) to fastest. */
export const SPEED_BANDS = SPEED_BAND_MAX.map((_, band) => band).concat(SPEED_BAND_MAX.length)

export function speedBand(kmh: number): number {
  const band = SPEED_BAND_MAX.findIndex((max) => kmh <= max)
  return band === -1 ? SPEED_BAND_MAX.length : band
}

export function speedBandLabel(band: number): string {
  const from = band === 0 ? 1 : SPEED_BAND_MAX[band - 1] + 1
  return band === SPEED_BAND_MAX.length ? `${from}+` : `${from}-${SPEED_BAND_MAX[band]}`
}

export const STANDING_LABEL = '0'

/** How the arrow grows across the bands, as a factor of the glyph. The max keeps the fastest
 * arrow inside the viewBox's inscribed circle, so no bearing clips a corner off it; the min is a
 * legibility floor — under ~0.6 the slowest arrow is lost among the pings either side of it. */
const BAND_SCALE_MIN = 0.62
const BAND_SCALE_MAX = 0.96
const bandScale = (band: number) =>
  BAND_SCALE_MIN + ((BAND_SCALE_MAX - BAND_SCALE_MIN) * band) / (SPEED_BANDS.length - 1)

const bandClass = (band: number) =>
  `ping-arrow${band < SPEED_BANDS.length / 2 ? ' ping-arrow--slow' : ''}`

const rotate = (deg: number) => `rotate(${deg} 12 12)`

const bandTransform = (deg: number, band: number) =>
  `${rotate(deg)} translate(12 12) scale(${bandScale(band).toFixed(2)}) translate(-12 -12)`

const STANDING_DISC = { cx: 12, cy: 12, r: 7.3 }
const STANDING_NEEDLE = 'M12 6 16 16 12 13.9 8 16Z'

const RIDE_END_DISC = { cx: 12, cy: 12, r: 10.6 }
const RIDE_END_CELLS = 4

/** Half of `.ping-badge`'s stroke-width in `map.scss`, which straddles the circle it is drawn
 * on — so the chequer stops at the rim's inner edge and the outline stays unbroken. */
const RIDE_END_RIM = 0.9
const RIDE_END_CLIP_ID = 'ride-end-badge-clip'

/**
 * Ring flagging a ping whose coordinates fall outside the service area. It marks the *position*
 * as unreal and nothing else — the glyph keeps the reported bearing and speed band, which are the
 * receiver's own readings and survive the spoofing (94-96% of spoofed fixes on 2026-06-14 carry a
 * non-zero bearing over ~250 distinct values), so nothing may be drawn over them.
 *
 * Hence a ring rather than a mark on the glyph, and this radius rather than a corner: the arrow
 * rotates, so its tip sweeps every direction at r≈10.8 ({@link BAND_SCALE_MAX} keeps it inside the
 * inscribed circle) and any badge inside that reach would cover the tip at some bearing. Stroked
 * at 11.4 it rides the boundary — clear of the arrow, and just inside the viewBox at 12.
 */
const ARTIFACT_RING = { cx: 12, cy: 12, r: 11.4 }

const artifactRingMarkup = (artifact: boolean) =>
  artifact
    ? `<circle class="ping-artifact-ring" cx="${ARTIFACT_RING.cx}" cy="${ARTIFACT_RING.cy}" r="${ARTIFACT_RING.r}"/>`
    : ''

/**
 * The rotation is an SVG *presentation attribute*, deliberately not a `style` attribute:
 * `style-src` in `csp.ts` omits `'unsafe-inline'`, so an inline style would be dropped by the
 * browser and every glyph would render pointing north. Presentation attributes aren't inline
 * CSS and are unaffected.
 */
export const arrowSvgMarkup = (deg: number, band: number, artifact = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  `<path class="${bandClass(band)}" d="${ARROW_PATH}" transform="${bandTransform(deg, band)}"/>` +
  artifactRingMarkup(artifact) +
  `</svg>`

const STANDING_DISC_CLASS = 'ping-badge ping-badge--standing'

const discMarkup = (
  { cx, cy, r }: { cx: number; cy: number; r: number },
  className = 'ping-badge',
) => `<circle class="${className}" cx="${cx}" cy="${cy}" r="${r}"/>`

/** A bearing of `undefined` leaves the needle off rather than inventing a heading. */
export const standingSvgMarkup = (deg?: number, artifact = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  discMarkup(STANDING_DISC, STANDING_DISC_CLASS) +
  (deg === undefined
    ? ''
    : `<path class="ping-badge-mark" d="${STANDING_NEEDLE}" transform="${rotate(deg)}"/>`) +
  artifactRingMarkup(artifact) +
  `</svg>`

/** Cells laid over the whole badge and clipped back to it, so the chequer runs to the edge the
 * way a flag's does rather than sitting in the middle as a smaller square. */
const chequerMarkup = () => {
  const clipR = RIDE_END_DISC.r - RIDE_END_RIM
  const cell = (2 * clipR) / RIDE_END_CELLS
  const origin = RIDE_END_DISC.cx - clipR
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
  return (
    `<clipPath id="${RIDE_END_CLIP_ID}">` +
    `<circle cx="${RIDE_END_DISC.cx}" cy="${RIDE_END_DISC.cy}" r="${clipR}"/>` +
    `</clipPath>` +
    `<g clip-path="url(#${RIDE_END_CLIP_ID})">${cells.join('')}</g>`
  )
}

export const rideEndSvgMarkup = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  discMarkup(RIDE_END_DISC) +
  chequerMarkup() +
  `</svg>`

/**
 * Leaflet adds these to the marker's own y-derived z-index, so a step has to outweigh the
 * vertical gap between two markers close enough to hide one another — which 1000 clears many
 * times over.
 *
 * Pings stack smallest-first, the inverse of {@link bandScale}: zoomed out a whole ride
 * collapses into a few pixels, and in the default order the fast arrows would cover the slow
 * ones, which are exactly the pings worth seeing.
 */
const Z_STEP = 1000
export const bearingZIndex = (band: number) => (SPEED_BANDS.length - band) * Z_STEP
export const STANDING_Z_INDEX = (SPEED_BANDS.length + 1) * Z_STEP
export const BOOKEND_Z_INDEX = (SPEED_BANDS.length + 2) * Z_STEP

/** For the legend: an element rather than an `<img src="data:…">`, which would seal the glyph
 * off from the stylesheet that paints it. */
export function VehicleBearingGlyph({ band, bearing = 0 }: { band: number; bearing?: number }) {
  return (
    <svg viewBox="0 0 24 24" className="vehicle-bearing-glyph" aria-hidden>
      <path className={bandClass(band)} d={ARROW_PATH} transform={bandTransform(bearing, band)} />
    </svg>
  )
}

export function VehicleStandingGlyph({ bearing = 0 }: { bearing?: number }) {
  return (
    <svg viewBox="0 0 24 24" className="vehicle-bearing-glyph" aria-hidden>
      <circle className={STANDING_DISC_CLASS} {...STANDING_DISC} />
      <path className="ping-badge-mark" d={STANDING_NEEDLE} transform={rotate(bearing)} />
    </svg>
  )
}

import {
  rideEndMarker,
  vehicleBearingMarker,
  vehiclePingMarkerClass,
  vehicleStandingMarker,
} from './MapContent'
import { SPEED_BAND_MAX } from './vehicleBearingGlyph'

const FAST = SPEED_BAND_MAX[SPEED_BAND_MAX.length - 1] + 20
const html = (bearing: number, kmh = FAST) =>
  vehicleBearingMarker(bearing, kmh).options.html as string

describe('vehicleBearingMarker', () => {
  it('turns the arrow by the ping bearing, about the centre of the 24x24 viewBox', () => {
    expect(html(78)).toContain('rotate(78 12 12)')
    expect(html(0)).toContain('rotate(0 12 12)')
    expect(html(359)).toContain('rotate(359 12 12)')
  })

  it('normalises bearings onto 0-359, so a full turn is the same icon as north', () => {
    expect(vehicleBearingMarker(360, FAST)).toBe(vehicleBearingMarker(0, FAST))
    expect(html(-90)).toContain('rotate(270 12 12)')
    expect(html(78.4)).toContain('rotate(78 12 12)')
  })

  it('reuses one icon instance per degree and speed band, keeping a long ride to a handful', () => {
    expect(vehicleBearingMarker(120, FAST)).toBe(vehicleBearingMarker(120, FAST))
    expect(vehicleBearingMarker(120, FAST)).toBe(vehicleBearingMarker(120, FAST + 30))
    expect(vehicleBearingMarker(120, FAST)).not.toBe(vehicleBearingMarker(121, FAST))
    expect(vehicleBearingMarker(120, FAST)).not.toBe(vehicleBearingMarker(120, 5))
  })

  it('grows the arrow with the speed, and fills in the fast half of the bands', () => {
    const scale = (kmh: number) => Number(/scale\(([\d.]+)\)/.exec(html(0, kmh))![1])

    expect(scale(5)).toBeLessThan(scale(25))
    expect(scale(25)).toBeLessThan(scale(FAST))
    // slow bands are drawn as an outline, fast ones solid — the size said a second way
    expect(html(0, 5)).toContain('ping-arrow--outline')
    expect(html(0, FAST)).not.toContain('ping-arrow--outline')
  })

  it('keeps the fastest arrow inside the viewBox, so no bearing clips a corner off it', () => {
    const scale = Number(/scale\(([\d.]+)\)/.exec(html(0, FAST))![1])
    // the glyph's furthest corner from the (12,12) rotation centre, which sweeps a circle
    const cornerRadius = Math.hypot(12 - 4.5, 12 - 2)
    expect(scale * cornerRadius).toBeLessThanOrEqual(12)
  })

  it('tags the arrow with the shared ping class, like the standing glyph', () => {
    expect(vehicleBearingMarker(45, FAST).options.className).toContain(vehiclePingMarkerClass)
  })

  // `style-src` in csp.ts has no 'unsafe-inline', so a rotation expressed as a style attribute
  // is silently dropped by the browser and every arrow points north. Keep it out of the markup.
  it('carries no inline style attribute, which the app CSP would refuse to apply', () => {
    expect(html(45)).not.toContain('style=')
  })
})

describe('vehicleStandingMarker', () => {
  const html = (bearing?: number) => vehicleStandingMarker(bearing).options.html as string

  it('faces the needle the way the bus did, which a plain dot could not', () => {
    expect(html(90)).toContain('rotate(90 12 12)')
    expect(html(-90)).toContain('rotate(270 12 12)')
  })

  it('reuses one icon per degree, and keeps the bearing-less one apart from north', () => {
    expect(vehicleStandingMarker(30)).toBe(vehicleStandingMarker(30))
    expect(vehicleStandingMarker(undefined)).not.toBe(vehicleStandingMarker(0))
  })

  it('shares the ping class with the arrow, so either shape can be selected the same way', () => {
    expect(vehicleStandingMarker(0).options.className).toContain(vehiclePingMarkerClass)
  })

  it('gets the same box as the arrows, so the click target does not change with the shape', () => {
    expect(vehicleStandingMarker(0).options.iconSize).toEqual(
      vehicleBearingMarker(0, FAST).options.iconSize,
    )
  })
})

describe('rideEndMarker', () => {
  const html = rideEndMarker.options.html as string

  it('is chequered — alternating cells, not a solid block', () => {
    // a 4x4 chequer inks 8 cells; a solid block would ink 16, an empty one none
    expect(html.match(/ping-badge-mark/g)).toHaveLength(8)
  })

  it('clips the chequer to the badge, so it runs to the edge without escaping the disc', () => {
    const clipId = /<clipPath id="([^"]+)">/.exec(html)![1]
    expect(html).toContain(`clip-path="url(#${clipId})"`)
    // the clip circle is the badge, a hair smaller so the rim survives on top of the cells
    const clipR = Number(/<clipPath[^>]*><circle[^>]*r="([\d.]+)"/.exec(html)![1])
    const discR = Number(/<circle class="ping-badge"[^>]*r="([\d.]+)"/.exec(html)![1])
    expect(clipR).toBeLessThan(discR)
  })

  it('sits in the same disc the ride-start marker uses, and leaves its colours to the sheet', () => {
    expect(html).toContain('class="ping-badge"')
    expect(html).not.toContain('fill=')
    expect(html).not.toContain('style=')
  })

  it('shares the ping class, so the last ping stays selectable like any other', () => {
    expect(rideEndMarker.options.className).toContain(vehiclePingMarkerClass)
  })
})

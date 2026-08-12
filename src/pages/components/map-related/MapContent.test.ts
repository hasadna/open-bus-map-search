import { vehicleBearingMarker, vehiclePingMarkerClass } from './MapContent'
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

  it('tags the arrow with the shared ping class, like the dot it replaces', () => {
    expect(vehicleBearingMarker(45, FAST).options.className).toContain(vehiclePingMarkerClass)
  })

  // `style-src` in csp.ts has no 'unsafe-inline', so a rotation expressed as a style attribute
  // is silently dropped by the browser and every arrow points north. Keep it out of the markup.
  it('carries no inline style attribute, which the app CSP would refuse to apply', () => {
    expect(html(45)).not.toContain('style=')
  })
})

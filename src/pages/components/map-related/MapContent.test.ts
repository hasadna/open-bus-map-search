import {
  vehicleBearingMarker,
  vehicleBearingMarkerPath,
  vehiclePingMarkerClass,
} from './MapContent'

const html = (bearing: number) => vehicleBearingMarker(bearing).options.html as string

describe('vehicleBearingMarker', () => {
  it('turns the arrow by the ping bearing, about the centre of the 24x24 viewBox', () => {
    expect(html(78)).toContain('rotate(78 12 12)')
    expect(html(0)).toContain('rotate(0 12 12)')
    expect(html(359)).toContain('rotate(359 12 12)')
  })

  it('normalises bearings onto 0-359, so a full turn is the same icon as north', () => {
    expect(vehicleBearingMarker(360)).toBe(vehicleBearingMarker(0))
    expect(html(-90)).toContain('rotate(270 12 12)')
    expect(html(78.4)).toContain('rotate(78 12 12)')
  })

  it('reuses one icon instance per degree, keeping a long ride to a handful of icons', () => {
    expect(vehicleBearingMarker(120)).toBe(vehicleBearingMarker(120))
    expect(vehicleBearingMarker(120)).not.toBe(vehicleBearingMarker(121))
  })

  it('tags the arrow with the shared ping class, like the dot it replaces', () => {
    expect(vehicleBearingMarker(45).options.className).toContain(vehiclePingMarkerClass)
  })

  // `style-src` in csp.ts has no 'unsafe-inline', so a rotation expressed as a style attribute
  // is silently dropped by the browser and every arrow points north. Keep it out of the markup.
  it('carries no inline style attribute, which the app CSP would refuse to apply', () => {
    expect(html(45)).not.toContain('style=')
    expect(vehicleBearingMarkerPath).not.toContain('style=')
  })
})

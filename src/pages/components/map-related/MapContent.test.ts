import { vehicleBearingMarker, vehiclePingMarkerClass } from './MapContent'

const html = (bearing: number) => vehicleBearingMarker(bearing).options.html as string

describe('vehicleBearingMarker', () => {
  it('rotates the arrow by the ping bearing', () => {
    expect(html(78)).toContain('rotate(78deg)')
    expect(html(0)).toContain('rotate(0deg)')
    expect(html(359)).toContain('rotate(359deg)')
  })

  it('normalises bearings onto 0-359, so a full turn is the same icon as north', () => {
    expect(vehicleBearingMarker(360)).toBe(vehicleBearingMarker(0))
    expect(html(-90)).toContain('rotate(270deg)')
    expect(html(78.4)).toContain('rotate(78deg)')
  })

  it('reuses one icon instance per degree, keeping a long ride to a handful of icons', () => {
    expect(vehicleBearingMarker(120)).toBe(vehicleBearingMarker(120))
    expect(vehicleBearingMarker(120)).not.toBe(vehicleBearingMarker(121))
  })

  it('tags the arrow with the shared ping class, like the dot it replaces', () => {
    expect(vehicleBearingMarker(45).options.className).toContain(vehiclePingMarkerClass)
  })
})

import {
  arrowSvgMarkup,
  bearingZIndex,
  BOOKEND_Z_INDEX,
  isStanding,
  rideEndSvgMarkup,
  SPEED_BAND_MAX,
  SPEED_BANDS,
  speedBand,
  speedBandLabel,
  STANDING_LABEL,
  STANDING_Z_INDEX,
  standingSvgMarkup,
} from './vehicleBearingGlyph'

/**
 * The speed ramp the ping arrows are drawn from. Bands are a deliberate quantisation, not a
 * rounding artefact: they keep the marker cache to a few hundred icons, and they give the
 * legend something finite to spell out.
 */

const TOP = SPEED_BAND_MAX.length

describe('isStanding', () => {
  // The whole point of the standing glyph is that it means one exact reading, so that the
  // marker can never say "stopped" over a tooltip that says 3 km/h.
  it('is the exact zero the vehicle reported, with no tolerance band under it', () => {
    expect(isStanding(0)).toBe(true)
    expect(isStanding(1)).toBe(false)
    expect(isStanding(0.4)).toBe(false)
  })
})

describe('speedBand', () => {
  it('puts a speed in the first band whose ceiling covers it', () => {
    expect(speedBand(1)).toBe(0)
    expect(speedBand(SPEED_BAND_MAX[0])).toBe(0)
    expect(speedBand(SPEED_BAND_MAX[0] + 0.1)).toBe(1)
    expect(speedBand(SPEED_BAND_MAX[1])).toBe(1)
  })

  it('leaves the top band open-ended, so no speed falls off the ramp', () => {
    expect(speedBand(SPEED_BAND_MAX[TOP - 1] + 1)).toBe(TOP)
    expect(speedBand(500)).toBe(TOP)
  })
})

describe('speedBandLabel', () => {
  // Spelled out rather than rebuilt from SPEED_BAND_MAX: a change to the ramp then has to be
  // read back off the legend it produces, and the standing glyph's 0 has to still meet the
  // first band's 1 with no km/h left unaccounted for between any two rungs.
  it('spells each band out as its km/h range, the last one open-ended', () => {
    expect(STANDING_LABEL).toBe('0')
    expect(SPEED_BANDS.map(speedBandLabel)).toEqual([
      '1-15',
      '16-23',
      '24-35',
      '36-55',
      '56-85',
      '86+',
    ])
  })
})

describe('arrowSvgMarkup', () => {
  it('paints nothing itself, leaving the colours to the stylesheet that can theme them', () => {
    const markup = arrowSvgMarkup(45, 0)

    expect(markup).toContain('ping-arrow')
    expect(markup).not.toContain('fill=')
    expect(markup).not.toContain('stroke=')
  })

  it('reddens the slow half and only the slow half', () => {
    expect(arrowSvgMarkup(0, 0)).toContain('ping-arrow--slow')
    expect(arrowSvgMarkup(0, TOP)).not.toContain('ping-arrow--slow')
  })

  it('keeps the slowest arrow big enough to find, not merely big enough to draw', () => {
    const scale = Number(/scale\(([\d.]+)\)/.exec(arrowSvgMarkup(0, 0))![1])

    expect(scale).toBeGreaterThanOrEqual(0.6)
  })
})

describe('standingSvgMarkup', () => {
  it('turns the needle to the bearing while the disc stays on the ping', () => {
    expect(standingSvgMarkup(120)).toContain('rotate(120 12 12)')
    expect(standingSvgMarkup(120)).toContain('cx="12" cy="12"')
  })

  it('drops the needle when there is no bearing, rather than inventing a heading', () => {
    expect(standingSvgMarkup(undefined)).not.toContain('rotate(')
    expect(standingSvgMarkup(undefined)).toContain('ping-badge')
  })

  it('rims the parked bus in the slow ramp colour, which the ride-end badge must not take', () => {
    expect(standingSvgMarkup(0)).toContain('ping-badge--standing')
    expect(rideEndSvgMarkup()).not.toContain('ping-badge--standing')
  })
})

describe('marker stacking', () => {
  // Zoomed out, a ride is a handful of pixels: whatever sits lowest here is what gets buried.
  it('puts the ride bookends over every ping, and the smaller pings over the bigger ones', () => {
    const bands = SPEED_BANDS.map(bearingZIndex)

    expect(BOOKEND_Z_INDEX).toBeGreaterThan(STANDING_Z_INDEX)
    expect(STANDING_Z_INDEX).toBeGreaterThan(Math.max(...bands))
    // strictly descending: band 0 is the smallest arrow and stays on top of the rest
    expect(bands).toEqual([...bands].sort((a, b) => b - a))
    expect(new Set(bands).size).toBe(bands.length)
  })
})

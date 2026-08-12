import {
  arrowSvgMarkup,
  bearingZIndex,
  BOOKEND_Z_INDEX,
  isStanding,
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

  it('covers every band it advertises', () => {
    expect(SPEED_BANDS).toEqual([...SPEED_BAND_MAX.map((_, i) => i), TOP])
  })
})

describe('speedBandLabel', () => {
  it('reads as the km/h range the band covers', () => {
    expect(speedBandLabel(0)).toBe(`1-${SPEED_BAND_MAX[0]}`)
    expect(speedBandLabel(1)).toBe(`${SPEED_BAND_MAX[0] + 1}-${SPEED_BAND_MAX[1]}`)
    expect(speedBandLabel(TOP)).toBe(`${SPEED_BAND_MAX[TOP - 1] + 1}+`)
  })

  it('picks up at 1, right where the standing glyph leaves off', () => {
    expect(STANDING_LABEL).toBe('0')
    expect(speedBandLabel(0).startsWith('1')).toBe(true)
  })
})

describe('arrowSvgMarkup', () => {
  it('paints nothing itself, leaving the colours to the stylesheet that can theme them', () => {
    const markup = arrowSvgMarkup(45, TOP)

    expect(markup).toContain('class="ping-arrow"')
    expect(markup).not.toContain('fill=')
    expect(markup).not.toContain('stroke=')
  })

  it('marks the slow half of the bands as outlines and the fast half as solid', () => {
    expect(arrowSvgMarkup(0, 0)).toContain('ping-arrow--outline')
    expect(arrowSvgMarkup(0, TOP)).not.toContain('ping-arrow--outline')
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

  it('leaves its colours to the stylesheet, like the arrow', () => {
    expect(standingSvgMarkup(0)).not.toContain('fill=')
    expect(standingSvgMarkup(0)).not.toContain('style=')
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

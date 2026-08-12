import {
  arrowSvgMarkup,
  SPEED_BAND_MAX,
  SPEED_BANDS,
  speedBand,
  speedBandLabel,
  STANDING_KMH,
  STANDING_LABEL,
} from './vehicleBearingGlyph'

/**
 * The speed ramp the ping arrows are drawn from. Bands are a deliberate quantisation, not a
 * rounding artefact: they keep the marker cache to a few hundred icons, and they give the
 * legend something finite to spell out.
 */

const TOP = SPEED_BAND_MAX.length

describe('speedBand', () => {
  it('puts a speed in the first band whose ceiling covers it', () => {
    expect(speedBand(STANDING_KMH)).toBe(0)
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
    expect(speedBandLabel(0)).toBe(`${Math.ceil(STANDING_KMH)}-${SPEED_BAND_MAX[0]}`)
    expect(speedBandLabel(1)).toBe(`${SPEED_BAND_MAX[0] + 1}-${SPEED_BAND_MAX[1]}`)
    expect(speedBandLabel(TOP)).toBe(`${SPEED_BAND_MAX[TOP - 1] + 1}+`)
  })

  it('picks up exactly where the ring leaves off, with no speed unaccounted for', () => {
    expect(STANDING_LABEL).toBe(`<${Math.ceil(STANDING_KMH)}`)
    expect(speedBandLabel(0).startsWith(`${Math.ceil(STANDING_KMH)}`)).toBe(true)
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

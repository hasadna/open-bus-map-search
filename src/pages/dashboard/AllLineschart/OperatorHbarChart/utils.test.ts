import { getColorByHashString } from './utils'

describe('getColorByHashString', () => {
  it('returns a valid hex color for a given input', () => {
    const color = getColorByHashString('מפעיל חדש')
    expect(color).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('returns the same color for the same input (deterministic)', () => {
    expect(getColorByHashString('אגד')).toBe(getColorByHashString('אגד'))
  })

  it('returns a valid hex color for an empty string', () => {
    const color = getColorByHashString('')
    expect(color).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

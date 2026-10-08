import { describe, expect, it } from 'vitest'
import { isValidIsraeliId } from './ComplaintModalFields'

describe('complaint ID validation', () => {
  it('accepts a nine-digit ID with a valid checksum', () => {
    expect(isValidIsraeliId('000000000')).toBe(true)
  })

  it('rejects malformed IDs and invalid checksums', () => {
    expect(isValidIsraeliId('000000001')).toBe(false)
    expect(isValidIsraeliId('123')).toBe(false)
    expect(isValidIsraeliId('ABCDEFGHI')).toBe(false)
  })
})

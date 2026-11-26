import type { FormInstance } from 'antd'
import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'
import { allComplaintFields, createAllRules, isValidIsraeliId } from './ComplaintModalFields'

const rules = (lang?: string) =>
  createAllRules({} as FormInstance, ((key: string) => key) as TFunction, lang)

describe('complaint checklist validation', () => {
  it.each([
    [undefined, 'אביב 123', true],
    ['he', 'Alice', false],
    ['en', 'Alice אב אביב محمد 123', true],
    ['ar', 'محمد', true],
    ['ru', 'Иван', false],
    ['en', 'Alice & Bob', false],
    ['he', '<אביב>', false],
  ])('validates %s names: %s', (lang, name, valid) => {
    const patternRule = rules(lang).firstName.find(
      (rule) => typeof rule === 'object' && 'pattern' in rule,
    )
    expect(
      patternRule &&
        typeof patternRule === 'object' &&
        'pattern' in patternRule &&
        patternRule.pattern?.test(name),
    ).toBe(valid)
  })

  it('allows 100-character names and optional wait times, and requires a station', () => {
    expect(rules().firstName).toContainEqual({ required: true, min: 1, max: 100 })
    expect(allComplaintFields.firstName.props).toMatchObject({ maxLength: 100 })
    expect(rules().wait).toEqual([])
    expect(allComplaintFields.raisingStation.rules).toContainEqual({ required: true })
  })

  it.each(['Valid description', 'A & B', 'Hello <world>', 'Hello > world'])(
    'checks forbidden description characters in %s',
    (text) => {
      const rule = allComplaintFields.details.rules?.find(
        (rule) => typeof rule === 'object' && 'pattern' in rule,
      )
      expect(
        rule && typeof rule === 'object' && 'pattern' in rule && rule.pattern?.test(text),
      ).toBe(text === 'Valid description')
    },
  )

  it('allows short passports and rejects whitespace-only passports', async () => {
    const rule = rules().passport[1]
    if (typeof rule !== 'object' || !('validator' in rule))
      throw new Error('Missing passport validator')
    await expect(rule.validator?.(rule, 'A', () => undefined)).resolves.toBeUndefined()
    await expect(rule.validator?.(rule, ' ', () => undefined)).rejects.toThrow()
    await expect(rule.validator?.(rule, '12345678901', () => undefined)).rejects.toThrow()
  })
})

describe('complaint ID validation', () => {
  it('accepts any nine-digit ID without requiring a checksum', () => {
    expect(isValidIsraeliId('000000000')).toBe(true)
    expect(isValidIsraeliId('000000001')).toBe(true)
  })

  it('rejects malformed IDs', () => {
    expect(isValidIsraeliId('123')).toBe(false)
    expect(isValidIsraeliId('ABCDEFGHI')).toBe(false)
  })
})

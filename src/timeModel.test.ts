import {
  type CivilDate,
  civilDate,
  civilDateTime,
  instant,
  isCivilDate,
  isInstant,
  isWallTime,
  parseCivilDateTime,
  type WallTime,
  wallTime,
} from './timeModel'

/** Narrow `T | null` to `T`, failing the test loudly on null. Lets the assertions below
 *  read straight through a smart constructor without a non-null `!` (banned by lint). */
function assertOk<T>(value: T | null): T {
  if (value === null) throw new Error('expected a non-null value')
  return value
}

describe('civilDate', () => {
  it('accepts a canonical calendar day and returns it unchanged', () => {
    expect(civilDate('2026-06-30')).toBe('2026-06-30')
  })

  it('rejects overflow dates that a naive parse would silently roll', () => {
    expect(civilDate('2026-02-30')).toBeNull()
    expect(civilDate('2026-13-01')).toBeNull()
    expect(civilDate('2026-00-10')).toBeNull()
  })

  it('rejects non-canonical or malformed shapes', () => {
    expect(civilDate('2026-6-30')).toBeNull() // unpadded month
    expect(civilDate('2026/06/30')).toBeNull()
    expect(civilDate('14:30')).toBeNull()
    expect(civilDate('')).toBeNull()
  })

  it('isCivilDate guards only canonical strings', () => {
    expect(isCivilDate('2026-06-30')).toBe(true)
    expect(isCivilDate('2026-02-30')).toBe(false)
    expect(isCivilDate(20260630)).toBe(false)
    expect(isCivilDate(undefined)).toBe(false)
  })
})

describe('wallTime', () => {
  it('accepts and zero-pads a 1-digit hour', () => {
    expect(wallTime('9:30')).toBe('09:30')
    expect(wallTime('09:30')).toBe('09:30')
  })

  it('accepts extended hours for past-midnight service rides', () => {
    expect(wallTime('25:30')).toBe('25:30')
    expect(wallTime('27:59')).toBe('27:59')
  })

  it('rejects out-of-range and malformed values', () => {
    expect(wallTime('12:60')).toBeNull() // minute overflow
    expect(wallTime('48:00')).toBeNull() // hour past the format ceiling
    expect(wallTime('12:5')).toBeNull() // unpadded minute
    expect(wallTime('2026-06-30')).toBeNull()
    expect(wallTime('')).toBeNull()
  })

  it('isWallTime guards only canonical strings', () => {
    expect(isWallTime('25:30')).toBe(true)
    expect(isWallTime('9:30')).toBe(false) // not yet zero-padded → not canonical
    expect(isWallTime('99:99')).toBe(false)
  })
})

describe('civilDateTime', () => {
  it('parses a valid date + time pair', () => {
    const cdt = assertOk(parseCivilDateTime('2026-06-30', '25:30'))
    expect(cdt).toEqual({ date: '2026-06-30', time: '25:30' })
  })

  it('rejects the pair if either part is malformed', () => {
    expect(parseCivilDateTime('2026-02-30', '14:30')).toBeNull()
    expect(parseCivilDateTime('2026-06-30', '99:00')).toBeNull()
  })
})

describe('instant', () => {
  it('canonicalizes an Israel-offset rendering to UTC Z', () => {
    expect(instant('2024-07-12T14:30:00+03:00')).toBe('2024-07-12T11:30:00.000Z')
  })

  it('canonicalizes a Z input to full-precision Z', () => {
    expect(instant('2024-07-12T11:30:00Z')).toBe('2024-07-12T11:30:00.000Z')
  })

  it('keeps string-equality == instant-equality across different input offsets', () => {
    // Same physical moment, written two ways → byte-identical canonical strings.
    const a = assertOk(instant('2024-07-12T14:30:00+03:00')) // IDT wall clock
    const b = assertOk(instant('2024-07-12T11:30:00Z')) // the same moment in UTC
    expect(a).toBe(b)
  })

  it('rejects zone-less input (that is a CivilDateTime, not an instant)', () => {
    expect(instant('2024-07-12T14:30:00')).toBeNull()
    expect(instant('2024-07-12T14:30')).toBeNull()
  })

  it('rejects garbage', () => {
    expect(instant('2026-06-30')).toBeNull()
    expect(instant('not a date')).toBeNull()
    expect(instant('')).toBeNull()
  })

  it('isInstant guards only the canonical at-rest form', () => {
    expect(isInstant('2024-07-12T11:30:00.000Z')).toBe(true)
    expect(isInstant('2024-07-12T14:30:00+03:00')).toBe(false) // valid moment, not at-rest form
    expect(isInstant('2024-07-12T11:30:00Z')).toBe(false) // missing millisecond precision
    expect(isInstant(1720783800000)).toBe(false)
  })
})

describe('brand contract (compile-time)', () => {
  // These assertions are validated by tsc/ts-jest, not at runtime: each @ts-expect-error
  // turns into a build failure if the brand it guards ever stops enforcing the rail.
  it('keeps the rails mutually unassignable while assignable to string', () => {
    const date = assertOk(civilDate('2026-06-30'))
    const moment = assertOk(instant('2024-07-12T11:30:00Z'))

    // A branded value still IS a plain string — this must compile with no directive.
    const asString: string = date
    expect(asString).toBe('2026-06-30')

    // @ts-expect-error a raw string must be minted through the civilDate() constructor
    const fromRaw: CivilDate = '2026-06-30'
    expect(fromRaw).toBe('2026-06-30')

    // @ts-expect-error a CivilDate is a different rail from a WallTime
    const dateAsWall: WallTime = date
    expect(dateAsWall).toBe('2026-06-30')

    // @ts-expect-error an Instant is a different rail from a WallTime
    const instantAsWall: WallTime = moment
    expect(instantAsWall).toBe('2024-07-12T11:30:00.000Z')

    // @ts-expect-error civilDateTime requires branded inputs, not raw strings
    const cdt = civilDateTime('2026-06-30', '14:30')
    expect(cdt.date).toBe('2026-06-30')
  })
})

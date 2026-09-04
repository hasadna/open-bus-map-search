import { expect, test } from '@playwright/test'
import { FIXTURE_DATE, israelTime, siriWindow, utcDayBeforeClock } from './date'

// Anchor for the FIXTURE_DATE-derived stride dates: pins each helper to a value captured from a
// real vehicle-page run. A drifted derivation fails here pointing straight at the helper — a
// clearer signal than the "unmocked request" the same break causes in vehicle.spec. These
// literals are valid only for the FIXTURE_DATE below; changing the knob must re-capture them
// (a deliberate, reviewed event — see tests/fixtures/date.ts), which the first assertion flags.
test('fixture date derivation is anchored to captured reference values', () => {
  expect(FIXTURE_DATE, 're-capture the reference dates below when FIXTURE_DATE changes').toBe(
    '2024-02-12',
  )
  expect(siriWindow()).toEqual({
    from: '2024-02-11T22:00:00.000Z',
    to: '2024-02-12T21:59:59.999Z',
  })
  expect([utcDayBeforeClock(1), utcDayBeforeClock(7)]).toEqual(['2024-02-11', '2024-02-05'])
  expect(israelTime(4, 30).toISOString()).toBe('2024-02-12T02:30:00.000Z')
  expect(israelTime(8, 0).toISOString()).toBe('2024-02-12T06:00:00.000Z')
  expect(israelTime(23, 30).toISOString()).toBe('2024-02-12T21:30:00.000Z')
})

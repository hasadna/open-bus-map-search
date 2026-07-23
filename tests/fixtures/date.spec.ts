import { expect, test } from '@playwright/test'
import { FIXTURE_DATE, gtfsDay, israelServiceTime, siriWindow } from './date'

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
    to: '2024-02-13T02:00:00.000Z',
  })
  expect(gtfsDay()).toBe('2024-02-11')
  expect(israelServiceTime(4, 30).toISOString()).toBe('2024-02-12T02:30:00.000Z')
  expect(israelServiceTime(8, 0).toISOString()).toBe('2024-02-12T06:00:00.000Z')
  expect(israelServiceTime(0, 30, { nextDay: true }).toISOString()).toBe('2024-02-12T22:30:00.000Z')
})

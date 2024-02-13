import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { getPastDate, setBrowserTime, test } from 'tests/utils'
// runs a cleanup after each test case (e.g. clearing jsdom)

expect.extend(matchers)
test.beforeEach(async ({ page }) => {
  await setBrowserTime(getPastDate(), page)
})

afterEach(() => {
  cleanup()
})

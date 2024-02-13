import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { getPastDate, setBrowserTime, test } from 'tests/utils'
// runs a cleanup after each test case (e.g. clearing jsdom)

global.ResizeObserver = require('resize-observer-polyfill')
test.beforeEach(async ({ page }) => {
  await setBrowserTime(getPastDate(), page)
})

afterEach(() => {
  cleanup()
})

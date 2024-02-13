import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
// runs a cleanup after each test case (e.g. clearing jsdom)

global.ResizeObserver = require('resize-observer-polyfill')
afterEach(() => {
  cleanup()
})

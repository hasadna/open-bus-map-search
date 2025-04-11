import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
// runs a cleanup after each test case (e.g. clearing jsdom)
import ResizeObserver from 'resize-observer-polyfill'

global.ResizeObserver = ResizeObserver
afterEach(() => {
  cleanup()
})

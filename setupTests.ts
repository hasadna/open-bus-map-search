import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
// runs a cleanup after each test case (e.g. clearing jsdom)

expect.extend(matchers)
afterEach(() => {
  cleanup()
})

import { TextDecoder, TextEncoder } from 'util'
import { ResizeObserver } from '@juggle/resize-observer'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import './src/locale/allTranslations'

global.ResizeObserver = ResizeObserver

// jsdom doesn't provide TextEncoder/TextDecoder, which react-router v7 needs at
// import time. Polyfill them so component tests can import router-using components.
if (typeof globalThis.TextEncoder === 'undefined') {
  Object.assign(globalThis, { TextEncoder, TextDecoder })
}
afterEach(() => {
  cleanup()
})

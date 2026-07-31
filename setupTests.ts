import { TextDecoder, TextEncoder } from 'util'
import { ResizeObserver } from '@juggle/resize-observer'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import './src/locale/allTranslations'

global.ResizeObserver = ResizeObserver
// jsdom omits TextEncoder/TextDecoder, which react-router v7 imports at module
// load — without these, any test that renders a routed component fails to import.
// (node's util provides them.)
global.TextEncoder ??= TextEncoder as typeof global.TextEncoder
global.TextDecoder ??= TextDecoder as typeof global.TextDecoder
afterEach(() => {
  cleanup()
})

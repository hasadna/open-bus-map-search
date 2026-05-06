import { ResizeObserver } from '@juggle/resize-observer'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import './src/locale/allTranslations'

global.ResizeObserver = ResizeObserver
afterEach(() => {
  cleanup()
})

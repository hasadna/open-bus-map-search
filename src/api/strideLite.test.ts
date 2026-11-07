import {
  isStrideLiteConfigured,
  isStrideLiteSelected,
  setStrideLiteApiBasePath,
  setStrideLiteOptedIn,
  strideApiBasePath,
  strideLiteApiBasePath,
} from './strideLite'

const PRODUCTION = process.env.VITE_STRIDE_API

afterEach(() => {
  vi.unstubAllEnvs()
  localStorage.clear()
})

describe('stride-lite opt-in', () => {
  test('production is the default, with no URL configured', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', '')
    expect(isStrideLiteConfigured()).toBe(false)
    expect(strideApiBasePath()).toBe(PRODUCTION)
  })

  test('configuring a URL alone does not move anyone off production', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    expect(isStrideLiteConfigured()).toBe(true)
    expect(isStrideLiteSelected()).toBe(false)
    expect(strideApiBasePath()).toBe(PRODUCTION)
  })

  test('opting in alone does not move anyone off production either', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', '')
    setStrideLiteOptedIn(true)
    expect(strideApiBasePath()).toBe(PRODUCTION)
  })

  test('both gates open routes Stride calls to the experimental backend', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example/')
    setStrideLiteOptedIn(true)
    expect(isStrideLiteSelected()).toBe(true)
    expect(strideApiBasePath()).toBe('https://stride-lite.example')
  })

  test('a runtime URL can be configured even when no build-time URL exists', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', '')
    setStrideLiteApiBasePath('https://runtime.example/api/')
    expect(strideLiteApiBasePath()).toBe('https://runtime.example/api')
    expect(isStrideLiteConfigured()).toBe(true)
    setStrideLiteOptedIn(true)
    expect(strideApiBasePath()).toBe('https://runtime.example/api')
  })

  test('a runtime URL overrides the build-time default and can be reset', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://build.example')
    setStrideLiteApiBasePath('https://runtime.example')
    expect(strideLiteApiBasePath()).toBe('https://runtime.example')
    setStrideLiteApiBasePath('')
    expect(strideLiteApiBasePath()).toBe('https://build.example')
  })

  test('opting back out returns to production', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    setStrideLiteOptedIn(true)
    setStrideLiteOptedIn(false)
    expect(strideApiBasePath()).toBe(PRODUCTION)
  })
})

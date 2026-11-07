import {
  isStrideLiteConfigured,
  isStrideLiteSelected,
  setStrideLiteOptedIn,
  strideApiBasePath,
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

  test('opting back out returns to production', () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    setStrideLiteOptedIn(true)
    setStrideLiteOptedIn(false)
    expect(strideApiBasePath()).toBe(PRODUCTION)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { loadEnv } from 'vite'

// Mock vite's loadEnv
vi.mock('vite', async () => {
  const actual = await vi.importActual('vite')
  return {
    ...actual,
    loadEnv: vi.fn(),
  }
})

describe('vite.config base URL', () => {
  it('should use ASSET_URL when defined', async () => {
    const mockEnv = { ASSET_URL: 'https://cdn.example.com/' }
    vi.mocked(loadEnv).mockReturnValue(mockEnv)

    // Dynamically import the config to get a fresh instance
    const { default: config } = await import('./vite.config')
    const configResult =
      typeof config === 'function' ? config({ mode: 'production', command: 'build' }) : config

    expect(configResult.base).toBe('https://cdn.example.com/')
  })

  it('should default to "/" when ASSET_URL is not defined', async () => {
    const mockEnv = {}
    vi.mocked(loadEnv).mockReturnValue(mockEnv)

    // Clear the module cache to get a fresh config
    vi.resetModules()
    const { default: config } = await import('./vite.config')
    const configResult =
      typeof config === 'function' ? config({ mode: 'production', command: 'build' }) : config

    expect(configResult.base).toBe('/')
  })

  it('should default to "/" when ASSET_URL is empty string', async () => {
    const mockEnv = { ASSET_URL: '' }
    vi.mocked(loadEnv).mockReturnValue(mockEnv)

    // Clear the module cache to get a fresh config
    vi.resetModules()
    const { default: config } = await import('./vite.config')
    const configResult =
      typeof config === 'function' ? config({ mode: 'production', command: 'build' }) : config

    expect(configResult.base).toBe('/')
  })

  it('should default to "/" when ASSET_URL is undefined', async () => {
    const mockEnv = { ASSET_URL: undefined }
    vi.mocked(loadEnv).mockReturnValue(mockEnv)

    // Clear the module cache to get a fresh config
    vi.resetModules()
    const { default: config } = await import('./vite.config')
    const configResult =
      typeof config === 'function' ? config({ mode: 'production', command: 'build' }) : config

    expect(configResult.base).toBe('/')
  })
})

import type { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import { setStrideLiteOptedIn } from 'src/api/strideLite'
import dayjs from 'src/dayjs'
import { combineTiles, fetchAggregation, queryFn } from './useVelocityAggregationData'

const siriGet = vi.hoisted(() => vi.fn())

vi.mock('src/api/apiConfig', () => ({
  SIRI_API: {
    velocityAggregationSiriVelocityAggregationSiriVelocityAggregationGet: siriGet,
  },
}))

const bounds = { minLat: 32, maxLat: 33, minLon: 34, maxLon: 35 }
const zoom = 10

// midday-normalised, like useVelocityAggregationData does before calling queryFn
const pastDate = dayjs().subtract(5, 'day').startOf('day').add(12, 'hour') // < yesterday → cache
const recentDate = dayjs().startOf('day').add(12, 'hour') // today → not < yesterday → API

const mockCacheOk = (rawSnakeRows: unknown[]) => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(rawSnakeRows) })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  global.fetch = vi.fn()
  setStrideLiteOptedIn(false)
})

describe('velocity-aggregation source selection', () => {
  it('past dates are read from the CDN cache, not the live API', async () => {
    // regression: old guard `isBefore(dayjs("yesterday"))` was always false → cache never hit
    mockCacheOk([{ total_sample_count: 10 }])
    await fetchAggregation(bounds, pastDate, zoom)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(vi.mocked(global.fetch).mock.calls[0][0]).toContain(
      'https://docbuvbfdq5r6.cloudfront.net/',
    )
    expect(siriGet).not.toHaveBeenCalled()
  })

  it('recent dates go to the live API and skip the cache', async () => {
    siriGet.mockResolvedValue([{ totalSampleCount: 10 }])
    await fetchAggregation(bounds, recentDate, zoom)

    expect(global.fetch).not.toHaveBeenCalled()
    expect(siriGet).toHaveBeenCalledTimes(1)
  })

  it("past dates go to the experimental API, not production's cache, while it is in use", async () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    setStrideLiteOptedIn(true)
    siriGet.mockResolvedValue([{ totalSampleCount: 10 }])
    try {
      await fetchAggregation(bounds, pastDate, zoom)
    } finally {
      vi.unstubAllEnvs()
      localStorage.clear()
    }

    expect(global.fetch).not.toHaveBeenCalled()
    expect(siriGet).toHaveBeenCalledTimes(1)
  })

  it('falls back to the live API when the cache lookup fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    siriGet.mockResolvedValue([{ totalSampleCount: 10 }])
    await fetchAggregation(bounds, pastDate, zoom)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(siriGet).toHaveBeenCalledTimes(1)
  })
})

describe('queryFn filtering is shared across sources', () => {
  it('drops points with totalSampleCount <= 4 from cached (past) data', async () => {
    mockCacheOk([{ total_sample_count: 10 }, { total_sample_count: 4 }, { total_sample_count: 1 }])
    const data = await queryFn(bounds, pastDate, zoom)
    expect(data).toHaveLength(1)
    expect(data[0].totalSampleCount).toBe(10)
  })

  it('drops points with totalSampleCount <= 4 from live (recent) data', async () => {
    siriGet.mockResolvedValue([{ totalSampleCount: 10 }, { totalSampleCount: 4 }])
    const data = await queryFn(bounds, recentDate, zoom)
    expect(data).toHaveLength(1)
    expect(data[0].totalSampleCount).toBe(10)
  })

  it("drops a cell labelled on the tile's lower edge, which belongs to the tile below", async () => {
    siriGet.mockResolvedValue([
      { totalSampleCount: 10, roundedLon: 34, roundedLat: 32.5 },
      { totalSampleCount: 10, roundedLon: 34.5, roundedLat: 32.5 },
    ])
    const data = await queryFn(bounds, recentDate, zoom)
    expect(data).toEqual([{ totalSampleCount: 10, roundedLon: 34.5, roundedLat: 32.5 }])
  })
})

describe('combineTiles', () => {
  const point = { totalSampleCount: 10 } as SiriVelocityAggregationPydanticModel

  it('reports no data only once every tile came back empty', () => {
    expect(combineTiles([{ data: [], isLoading: false, error: null }]).error?.message).toMatch(
      /No data points/,
    )
    expect(combineTiles([{ data: [], isLoading: true, error: null }]).error).toBeNull()
  })

  it('keeps drawing while a newly visible tile loads', () => {
    const combined = combineTiles([
      { data: [point], isLoading: false, error: null },
      { isLoading: true, error: null },
    ])
    expect(combined).toEqual({ data: [point], loading: false, error: null })
  })

  it('is not an error to look at no tile at all', () => {
    expect(combineTiles([])).toEqual({ data: [], loading: false, error: null })
  })
})

describe('rounding precision', () => {
  // The API rejects anything outside 0..10 with a 422, production and stride-lite alike.
  it.each([
    [11, 10],
    [-2, 0],
    [7, 7],
  ])('zoom %i asks for precision %i', async (requested, sent) => {
    siriGet.mockResolvedValue([{ totalSampleCount: 10 }])
    await fetchAggregation(bounds, recentDate, requested)
    expect(siriGet).toHaveBeenCalledWith(expect.objectContaining({ roundingPrecision: sent }))
  })
})

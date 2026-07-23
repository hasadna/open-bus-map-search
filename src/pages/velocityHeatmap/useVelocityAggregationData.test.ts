import dayjs from 'src/dayjs'
import { fetchAggregation, queryFn } from './useVelocityAggregationData'

jest.mock('src/api/apiConfig', () => ({
  SIRI_API: {
    velocityAggregationSiriVelocityAggregationSiriVelocityAggregationGet: jest.fn(),
  },
}))

const siriGet = jest.requireMock<{
  SIRI_API: {
    velocityAggregationSiriVelocityAggregationSiriVelocityAggregationGet: jest.Mock
  }
}>('src/api/apiConfig').SIRI_API
  .velocityAggregationSiriVelocityAggregationSiriVelocityAggregationGet

const bounds = { minLat: 32, maxLat: 33, minLon: 34, maxLon: 35 }
const zoom = 10

// midday-normalised, like useVelocityAggregationData does before calling queryFn
const pastDate = dayjs().subtract(5, 'day').startOf('day').add(12, 'hour') // < yesterday → cache
const recentDate = dayjs().startOf('day').add(12, 'hour') // today → not < yesterday → API

const mockCacheOk = (rawSnakeRows: unknown[]) => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: () => Promise.resolve(rawSnakeRows) })
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  global.fetch = jest.fn()
})

describe('velocity-aggregation source selection', () => {
  it('past dates are read from the CDN cache, not the live API', async () => {
    // regression: old guard `isBefore(dayjs("yesterday"))` was always false → cache never hit
    mockCacheOk([{ total_sample_count: 10 }])
    await fetchAggregation(bounds, pastDate, zoom)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(
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

  it('falls back to the live API when the cache lookup fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false })
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

  it('throws when cached data has no point above the sample threshold', async () => {
    mockCacheOk([{ total_sample_count: 2 }])
    await expect(queryFn(bounds, pastDate, zoom)).rejects.toThrow(/No data points/)
  })

  it('throws when live data has no point above the sample threshold', async () => {
    siriGet.mockResolvedValue([{ totalSampleCount: 2 }])
    await expect(queryFn(bounds, recentDate, zoom)).rejects.toThrow(/No data points/)
  })
})

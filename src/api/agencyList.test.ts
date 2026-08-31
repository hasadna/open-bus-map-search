import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'

const apiMock = vi.hoisted(() => vi.fn())

vi.mock('src/api/apiConfig', () => ({
  GTFS_API: { gtfsAgenciesListGet: apiMock },
}))

const agencies: GtfsAgencyPydanticModel[] = [
  { date: new Date('2026-06-21'), operatorRef: 3, agencyName: 'אגד' },
]

// The module memoizes its promise, so every test needs a fresh copy of it.
const loadGetAgencyList = async () => {
  vi.resetModules()
  return (await import('./agencyList')).getAgencyList
}

beforeEach(() => {
  apiMock.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getAgencyList', () => {
  it('fetches once and reuses the result', async () => {
    apiMock.mockResolvedValue(agencies)
    const getAgencyList = await loadGetAgencyList()

    expect(await getAgencyList()).toEqual(agencies)
    expect(await getAgencyList()).toEqual(agencies)
    expect(apiMock).toHaveBeenCalledTimes(1)
  })

  it('falls back to an earlier date when the first one has no agencies', async () => {
    apiMock.mockResolvedValueOnce([]).mockResolvedValueOnce(agencies)
    const getAgencyList = await loadGetAgencyList()

    expect(await getAgencyList()).toEqual(agencies)
    expect(apiMock).toHaveBeenCalledTimes(2)
  })

  it('retries on the next call when every attempt failed, instead of caching the failure', async () => {
    apiMock.mockRejectedValue(new Error('network down'))
    const getAgencyList = await loadGetAgencyList()

    expect(await getAgencyList()).toEqual([])

    apiMock.mockReset()
    apiMock.mockResolvedValue(agencies)

    expect(await getAgencyList()).toEqual(agencies)
  })
})

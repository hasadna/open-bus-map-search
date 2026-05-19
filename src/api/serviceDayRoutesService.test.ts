import dayjs from 'src/dayjs'
import { GTFS_API } from 'src/api/apiConfig'
import { getServiceDayRoutes } from './serviceDayRoutesService'

jest.mock('src/api/apiConfig', () => ({
  GTFS_API: {
    gtfsRoutesListGet: jest.fn(),
    gtfsRidesListGet: jest.fn(),
  },
}))

const mockRoutesGet = GTFS_API.gtfsRoutesListGet as jest.Mock
const mockRidesGet = GTFS_API.gtfsRidesListGet as jest.Mock

function makeRoute(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    date: new Date('2024-02-11T12:00:00Z'),
    lineRef: 1000,
    operatorRef: 97,
    routeShortName: '16',
    routeLongName: 'A ⟵ B',
    routeMkt: 'MKT1',
    routeDirection: '1',
    routeAlternative: 'A',
    agencyName: 'Test',
    routeType: 3,
    ...overrides,
  }
}

function makeRide(gtfsRouteId: number, overrides: Record<string, unknown> = {}) {
  return {
    gtfsRouteId,
    gtfsRouteDate: new Date('2024-02-12T12:00:00Z'),
    gtfsRouteLineRef: 1000,
    gtfsRouteOperatorRef: 97,
    gtfsRouteRouteShortName: '16',
    gtfsRouteRouteLongName: 'A ⟵ B',
    gtfsRouteRouteMkt: 'MKT1',
    gtfsRouteRouteDirection: '1',
    gtfsRouteRouteAlternative: 'A',
    gtfsRouteAgencyName: 'Test',
    gtfsRouteRouteType: 3,
    ...overrides,
  }
}

describe('getServiceDayRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRoutesGet.mockResolvedValue([])
    mockRidesGet.mockResolvedValue([])
  })

  it("returns today's routes", async () => {
    mockRoutesGet.mockResolvedValue([makeRoute(1)])
    const result = await getServiceDayRoutes(dayjs('2024-02-11'))
    expect(result).toHaveLength(1)
    expect(result[0].routeIds).toContain(1)
  })

  it('converts late-night rides into routes', async () => {
    mockRidesGet.mockResolvedValue([makeRide(42)])
    const result = await getServiceDayRoutes(dayjs('2024-02-11'))
    expect(result).toHaveLength(1)
    expect(result[0].routeIds).toContain(42)
  })

  it('merges routes with the same key and accumulates routeIds', async () => {
    mockRoutesGet.mockResolvedValue([makeRoute(1), makeRoute(2)])
    const result = await getServiceDayRoutes(dayjs('2024-02-11'))
    expect(result).toHaveLength(1)
    expect(result[0].routeIds).toEqual(expect.arrayContaining([1, 2]))
  })

  it('deduplicates late-night rides with the same gtfsRouteId', async () => {
    mockRidesGet.mockResolvedValue([makeRide(42), makeRide(42)])
    const result = await getServiceDayRoutes(dayjs('2024-02-11'))
    expect(result).toHaveLength(1)
  })

  it('excludes late-night rides missing required route fields', async () => {
    mockRidesGet.mockResolvedValue([{ gtfsRouteId: null }])
    const result = await getServiceDayRoutes(dayjs('2024-02-11'))
    expect(result).toHaveLength(0)
  })

  it('returns today routes when late-night fetch fails', async () => {
    mockRoutesGet.mockResolvedValue([makeRoute(1)])
    mockRidesGet.mockRejectedValue(new Error('network error'))
    const result = await getServiceDayRoutes(dayjs('2024-02-11'))
    expect(result).toHaveLength(1)
    expect(result[0].routeIds).toContain(1)
  })

  it('forwards operatorId and lineNumber to both API calls', async () => {
    await getServiceDayRoutes(dayjs('2024-02-11'), '97', '16')
    expect(mockRoutesGet).toHaveBeenCalledWith(
      expect.objectContaining({ operatorRefs: '97', routeShortName: '16' }),
      expect.anything(),
    )
    expect(mockRidesGet).toHaveBeenCalledWith(
      expect.objectContaining({ gtfsRouteOperatorRefs: '97', gtfsRouteRouteShortName: '16' }),
      expect.anything(),
    )
  })

  it('omits operator/line filters when not provided', async () => {
    await getServiceDayRoutes(dayjs('2024-02-11'))
    expect(mockRoutesGet).toHaveBeenCalledWith(
      expect.not.objectContaining({ operatorRefs: expect.anything() }),
      expect.anything(),
    )
  })

  it('passes AbortSignal to both API calls', async () => {
    const signal = new AbortController().signal
    await getServiceDayRoutes(dayjs('2024-02-11'), undefined, undefined, signal)
    expect(mockRoutesGet).toHaveBeenCalledWith(expect.anything(), { signal })
    expect(mockRidesGet).toHaveBeenCalledWith(expect.anything(), { signal })
  })

  it('uses limit 15000 for both requests', async () => {
    await getServiceDayRoutes(dayjs('2024-02-11'))
    expect(mockRoutesGet).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 15000 }),
      expect.anything(),
    )
    expect(mockRidesGet).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 15000 }),
      expect.anything(),
    )
  })
})

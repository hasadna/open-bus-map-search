import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'
import { getAllRoutesList, getRoutesAsync, getRoutesByLineRef } from './gtfsService'

jest.mock('src/api/apiConfig', () => ({
  GTFS_API: { gtfsRoutesListGet: jest.fn() },
}))

const mockApi = jest.requireMock<{
  GTFS_API: { gtfsRoutesListGet: jest.Mock }
}>('src/api/apiConfig').GTFS_API

// The generated client serializes date_from/date_to as Date.toISOString().slice(0, 10)
// — the UTC calendar date. These tests assert the *serialized* date matches the Israeli
// service day, which is the round-trip the off-by-one bug broke.
const serializedDate = (d: Date) => d.toISOString().slice(0, 10)

const firstCallParams = () =>
  mockApi.gtfsRoutesListGet.mock.calls[0][0] as { dateFrom: Date; dateTo: Date; lineRefs?: string }

function gtfsRoute(id: number, date: Date, overrides: Record<string, unknown> = {}) {
  return {
    id,
    date,
    lineRef: 1000,
    operatorRef: 3,
    routeShortName: '18',
    routeLongName: 'A ⟵ B',
    routeMkt: 'MKT1',
    routeDirection: '1',
    routeAlternative: 'A',
    agencyName: 'Test',
    routeType: 3,
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockApi.gtfsRoutesListGet.mockResolvedValue([])
})

describe('getAllRoutesList (operator page)', () => {
  it('queries the Israeli service day, not the UTC day before it', async () => {
    // dayjs.tz(date, IL).toDate() is the Israel-midnight instant the operator page passes
    // (21:00Z the previous day in summer) — the exact input that used to query one day early.
    const israelMidnight = dayjs.tz('2026-06-20', ISRAEL_TIMEZONE).toDate()

    await getAllRoutesList('3', israelMidnight)

    const params = firstCallParams()
    expect(serializedDate(params.dateFrom)).toBe('2026-06-20')
    expect(serializedDate(params.dateTo)).toBe('2026-06-20')
  })

  it('holds across the winter offset (+02:00)', async () => {
    const israelMidnight = dayjs.tz('2026-01-15', ISRAEL_TIMEZONE).toDate()

    await getAllRoutesList('3', israelMidnight)

    const params = firstCallParams()
    expect(serializedDate(params.dateFrom)).toBe('2026-01-15')
    expect(serializedDate(params.dateTo)).toBe('2026-01-15')
  })
})

describe('getRoutesByLineRef', () => {
  it('queries the Israeli service day and forwards the lineRef', async () => {
    const israelMidnight = dayjs.tz('2026-06-20', ISRAEL_TIMEZONE).toDate()

    await getRoutesByLineRef('3', '12345', israelMidnight)

    const params = firstCallParams()
    expect(serializedDate(params.dateFrom)).toBe('2026-06-20')
    expect(serializedDate(params.dateTo)).toBe('2026-06-20')
    expect(params.lineRefs).toBe('12345')
  })
})

describe('getRoutesAsync', () => {
  it('queries the Israeli service day for date_from', async () => {
    const day = dayjs.tz('2024-02-11', ISRAEL_TIMEZONE)

    await getRoutesAsync(day, day, '3', '18')

    const params = firstCallParams()
    expect(serializedDate(params.dateFrom)).toBe('2024-02-11')
    expect(serializedDate(params.dateTo)).toBe('2024-02-11')
  })

  it('returns the service-day routes (no compensating re-filter needed)', async () => {
    // A route the server returned for the queried day flows straight through now that the
    // query is correct — the previous-day re-filter that used to guard this is gone.
    const day = dayjs.tz('2024-02-11', ISRAEL_TIMEZONE)
    mockApi.gtfsRoutesListGet.mockResolvedValue([gtfsRoute(1, new Date('2024-02-11T12:00:00Z'))])

    const routes = await getRoutesAsync(day, day, '3', '18')

    expect(routes).toHaveLength(1)
    expect(routes[0].routeIds).toContain(1)
  })
})

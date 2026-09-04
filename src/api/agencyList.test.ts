import { GtfsAgencyPydanticModel } from '@hasadna/open-bus-api-client'
import { Query, QueryClient } from '@tanstack/react-query'
import type { GTFS_API } from 'src/api/apiConfig'
import {
  agencyListForDateQueryOptions,
  agencyListQueryOptions,
  fetchAgencyList,
  mergeAgencies,
} from './agencyList'

const agenciesListGet = vi.hoisted(() => vi.fn<typeof GTFS_API.gtfsAgenciesListGet>())

vi.mock('src/api/apiConfig', () => ({
  GTFS_API: { gtfsAgenciesListGet: agenciesListGet },
}))

const agency = (
  date: string,
  operatorRef: number,
  agencyName = `operator ${operatorRef}`,
): GtfsAgencyPydanticModel => ({ date: new Date(`${date}T00:00:00Z`), operatorRef, agencyName })

const newQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })

const requestOf = (call: number) => {
  const request = agenciesListGet.mock.calls[call]?.[0]
  if (!request) throw new Error(`gtfsAgenciesListGet was called less than ${call + 1} times`)
  return request
}

beforeEach(() => {
  agenciesListGet.mockReset()
})

describe('mergeAgencies', () => {
  it('keeps a single row per operator, with the name of its latest date', () => {
    expect(
      mergeAgencies([
        agency('2026-08-27', 3, 'former name'),
        agency('2026-08-29', 3, 'current name'),
        agency('2026-08-28', 5),
      ]),
    ).toEqual([agency('2026-08-29', 3, 'current name'), agency('2026-08-28', 5)])
  })

  it('leaves an already unique list untouched', () => {
    const agencies = [agency('2026-08-29', 3), agency('2026-08-29', 5)]
    expect(mergeAgencies(agencies)).toEqual(agencies)
  })
})

describe('fetchAgencyList', () => {
  it('asks for the requested range at noon UTC, and for more than the API default of 100 rows', async () => {
    agenciesListGet.mockResolvedValue([])

    await fetchAgencyList('2026-08-27', '2026-09-03')

    expect(requestOf(0).dateFrom).toEqual(new Date('2026-08-27T12:00:00Z'))
    expect(requestOf(0).dateTo).toEqual(new Date('2026-09-03T12:00:00Z'))
    // Without an explicit limit the API answers 100 rows - which, at one row per operator
    // per date, is barely three days of a range.
    expect(requestOf(0).limit).toBeGreaterThan(100)
  })

  it('merges the per-date rows a range answers with', async () => {
    agenciesListGet.mockResolvedValue([agency('2026-08-27', 3), agency('2026-09-03', 3)])

    await expect(fetchAgencyList('2026-08-27', '2026-09-03')).resolves.toEqual([
      agency('2026-09-03', 3),
    ])
  })
})

describe('agencyListForDateQueryOptions', () => {
  it('fetches the selected day alone when it holds data', async () => {
    agenciesListGet.mockResolvedValue([agency('2026-08-29', 3)])

    await expect(
      newQueryClient().fetchQuery(agencyListForDateQueryOptions('2026-08-29')),
    ).resolves.toEqual([agency('2026-08-29', 3)])
    expect(agenciesListGet).toHaveBeenCalledTimes(1)
    expect(requestOf(0).dateFrom).toEqual(new Date('2026-08-29T12:00:00Z'))
    expect(requestOf(0).dateTo).toEqual(new Date('2026-08-29T12:00:00Z'))
  })

  it('widens to the preceding week when the selected day is not ingested yet', async () => {
    agenciesListGet.mockResolvedValueOnce([]).mockResolvedValueOnce([agency('2026-08-28', 5)])

    await expect(
      newQueryClient().fetchQuery(agencyListForDateQueryOptions('2026-08-29')),
    ).resolves.toEqual([agency('2026-08-28', 5)])
    expect(requestOf(1).dateFrom).toEqual(new Date('2026-08-22T12:00:00Z'))
    expect(requestOf(1).dateTo).toEqual(new Date('2026-08-29T12:00:00Z'))
  })
})

describe('caching of an empty list', () => {
  const staleTimeFor = (data: GtfsAgencyPydanticModel[]) => {
    const { staleTime } = agencyListQueryOptions('2026-08-29', '2026-08-29')
    const query = { state: { data } } as Query<
      GtfsAgencyPydanticModel[],
      Error,
      GtfsAgencyPydanticModel[],
      string[]
    >
    return typeof staleTime === 'function' ? staleTime(query) : staleTime
  }

  it('is immediately stale, so a data hole is not frozen for the app-wide 24 hours', () => {
    expect(staleTimeFor([])).toBe(0)
    expect(staleTimeFor([agency('2026-08-29', 3)])).toBeGreaterThan(0)
  })
})

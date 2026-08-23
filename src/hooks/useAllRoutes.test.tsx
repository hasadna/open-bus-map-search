import { renderHook, waitFor } from '@testing-library/react'
import { getAllRoutesList } from 'src/api/gtfsService'
import { civilDate } from 'src/model/time/civilDate'
import { useAllRoutes } from './useAllRoutes'

vi.mock('src/api/gtfsService', () => ({
  getAllRoutesList: vi.fn(),
}))

const mockedGetAllRoutesList = vi.mocked(getAllRoutesList)

beforeEach(() => {
  vi.clearAllMocks()
  mockedGetAllRoutesList.mockResolvedValue([])
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useAllRoutes', () => {
  it('does not fetch when operatorId or date is missing', () => {
    const first = renderHook(() => useAllRoutes(undefined, civilDate('2026-06-21')!))
    first.unmount()

    const second = renderHook(() => useAllRoutes('3', undefined))
    second.unmount()

    expect(mockedGetAllRoutesList).not.toHaveBeenCalled()
  })

  it('passes the calendar day through verbatim, leaving the wire encoding to the api layer', async () => {
    renderHook(() => useAllRoutes('3', civilDate('2026-06-21')!))

    await waitFor(() => expect(mockedGetAllRoutesList).toHaveBeenCalled())

    // The UTC-noon anchoring that keeps the serialized date from drifting a day (#1680)
    // now lives in civilDateToApiDate, where civilDate.test.ts covers it.
    expect(mockedGetAllRoutesList).toHaveBeenCalledWith('3', '2026-06-21', expect.any(AbortSignal))
  })

  it('sets error state and clears loading when the fetch rejects', async () => {
    mockedGetAllRoutesList.mockRejectedValue(new Error('network'))

    const { result } = renderHook(() => useAllRoutes('3', civilDate('2026-06-21')!))

    await waitFor(() => expect(result.current.error).toBe(true))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.routes).toEqual([])
  })
})

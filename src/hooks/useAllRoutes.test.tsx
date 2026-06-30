import { renderHook, waitFor } from '@testing-library/react'
import { getAllRoutesList } from 'src/api/gtfsService'
import { useAllRoutes } from './useAllRoutes'

jest.mock('src/api/gtfsService', () => ({
  getAllRoutesList: jest.fn(),
}))

const mockedGetAllRoutesList = getAllRoutesList as jest.MockedFunction<typeof getAllRoutesList>

beforeEach(() => {
  jest.clearAllMocks()
  mockedGetAllRoutesList.mockResolvedValue([])
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('useAllRoutes', () => {
  it('does not fetch when operatorId or date is missing', () => {
    const first = renderHook(() => useAllRoutes(undefined, '2026-06-21'))
    first.unmount()

    const second = renderHook(() => useAllRoutes('3', undefined))
    second.unmount()

    expect(mockedGetAllRoutesList).not.toHaveBeenCalled()
  })

  it('passes a Date anchored to UTC noon, so the serialized date matches the input (#1680)', async () => {
    renderHook(() => useAllRoutes('3', '2026-06-21'))

    await waitFor(() => expect(mockedGetAllRoutesList).toHaveBeenCalled())

    const passedDate = mockedGetAllRoutesList.mock.calls[0][1] as Date

    expect(passedDate.toISOString()).toBe('2026-06-21T12:00:00.000Z')
    expect(passedDate.toISOString().substring(0, 10)).toBe('2026-06-21')
    expect(mockedGetAllRoutesList).toHaveBeenCalledWith(
      '3',
      expect.any(Date),
      expect.any(AbortSignal),
    )
  })

  it('sets error state and clears loading when the fetch rejects', async () => {
    mockedGetAllRoutesList.mockRejectedValue(new Error('network'))

    const { result } = renderHook(() => useAllRoutes('3', '2026-06-21'))

    await waitFor(() => expect(result.current.error).toBe(true))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.routes).toEqual([])
  })
})
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  getGtfsStopHitTimesAsync,
  getRoutesAsync,
  getStopsForRouteAsync,
} from 'src/api/gtfsService'
import { getSiriStopHitTimesAsync } from 'src/api/siriService'
import dayjs from 'src/dayjs'
import {
  GLOBAL_SEARCH_DEFAULTS,
  GlobalSearchContext,
  type GlobalSearchState,
} from 'src/model/globalState'
import { civilDate } from 'src/model/time/civilDate'
import StationStopsPage from './index'

// Mock API functions to avoid making real network requests.
vi.mock('src/api/gtfsService', () => ({
  getRoutesAsync: vi.fn(),
  getStopsForRouteAsync: vi.fn(),
  getGtfsStopHitTimesAsync: vi.fn(),
}))

vi.mock('src/api/siriService', () => ({
  getSiriStopHitTimesAsync: vi.fn(),
}))

// Replace the MUI time picker with a simple controlled input.
vi.mock('../components/TimeSelector', () => ({
  TimeSelector: ({
    time,
    onChange,
  }: {
    time: dayjs.Dayjs
    onChange: (value: dayjs.Dayjs | null) => void
  }) => (
    <input
      aria-label="Time"
      value={time.format('HH:mm')}
      onChange={(event) => {
        const [hours, minutes] = event.target.value.split(':').map(Number)
        onChange(time.hour(hours).minute(minutes))
      }}
    />
  ),
}))

// Other selectors are not relevant to the debounce behavior.
vi.mock('../components/CivilDateSelector', () => ({
  CivilDateSelector: () => null,
}))

vi.mock('src/pages/components/OperatorSelector', () => ({
  default: () => null,
}))

vi.mock('src/pages/components/LineSelector', () => ({
  default: () => null,
}))

vi.mock('src/pages/components/RouteSelector', () => ({
  default: () => null,
}))

vi.mock('src/pages/components/StopSelector', () => ({
  default: () => null,
}))

const DEBOUNCE_MS = 500

const search: GlobalSearchState = {
  ...GLOBAL_SEARCH_DEFAULTS,
  date: civilDate('2026-05-15')!,
  operatorId: '3',
  lineNumber: '10',
  routeKey: 'route-1',
  stopKey: null,
}

const route = {
  key: 'route-1',
  lineRef: '10',
  routeIds: [123],
} as unknown as Awaited<ReturnType<typeof getRoutesAsync>>[number]

beforeEach(() => {
  vi.clearAllMocks()

  // Start every test from the same selected time.
  sessionStorage.clear()
  sessionStorage.setItem('page:station-stops:params', JSON.stringify({ time: '06:00' }))

  vi.mocked(getRoutesAsync).mockResolvedValue([route])
  vi.mocked(getStopsForRouteAsync).mockResolvedValue([])
})

afterEach(() => {
  vi.useRealTimers()
})

describe('StationStopsPage time debounce', () => {
  it('fetches only for the final time after rapid changes', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <GlobalSearchContext.Provider value={{ search, setSearch: vi.fn() }}>
          <StationStopsPage />
        </GlobalSearchContext.Provider>
      </QueryClientProvider>,
    )

    // Wait for the initial route and stops request.
    await waitFor(() => {
      expect(getStopsForRouteAsync).toHaveBeenCalledTimes(1)
    })

    vi.useFakeTimers()

    const timeInput = screen.getByRole('textbox', { name: 'Time' })

    // Simulate two rapid changes without waiting between them.
    fireEvent.change(timeInput, { target: { value: '06:05' } })
    fireEvent.change(timeInput, { target: { value: '06:50' } })

    // The input should respond immediately.
    expect(timeInput).toHaveValue('06:50')

    // No intermediate time should trigger a new fetch.
    expect(getStopsForRouteAsync).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS - 1)
    })

    expect(getStopsForRouteAsync).toHaveBeenCalledTimes(1)

    // Only the final time should trigger the next fetch.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(getStopsForRouteAsync).toHaveBeenCalledTimes(2)

    const lastRequest = vi.mocked(getStopsForRouteAsync).mock.lastCall

    expect(lastRequest?.[1].format('HH:mm')).toBe('06:50')
  })
  it('fetches stop hit times only after the debounce delay', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    // Provide a selected stop so that hitsQuery can run.
    const stop = {
      key: 'stop-1',
      stopId: 12345,
    } as unknown as Awaited<ReturnType<typeof getStopsForRouteAsync>>[number]

    vi.mocked(getStopsForRouteAsync).mockResolvedValue([stop])
    vi.mocked(getGtfsStopHitTimesAsync).mockResolvedValue([])
    vi.mocked(getSiriStopHitTimesAsync).mockResolvedValue([])

    render(
      <QueryClientProvider client={queryClient}>
        <GlobalSearchContext.Provider
          value={{
            search: { ...search, stopKey: 'stop-1' },
            setSearch: vi.fn(),
          }}>
          <StationStopsPage />
        </GlobalSearchContext.Provider>
      </QueryClientProvider>,
    )

    // Wait for the initial hit-time requests to complete.
    await waitFor(() => {
      expect(getGtfsStopHitTimesAsync).toHaveBeenCalledTimes(1)
      expect(getSiriStopHitTimesAsync).toHaveBeenCalledTimes(1)
    })

    vi.useFakeTimers()

    const timeInput = screen.getByRole('textbox', { name: 'Time' })

    // Simulate multiple time changes within the debounce window.
    fireEvent.change(timeInput, { target: { value: '06:05' } })
    fireEvent.change(timeInput, { target: { value: '06:50' } })

    // Neither API should fetch data for intermediate time values.
    expect(getGtfsStopHitTimesAsync).toHaveBeenCalledTimes(1)
    expect(getSiriStopHitTimesAsync).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(499)
    })

    expect(getGtfsStopHitTimesAsync).toHaveBeenCalledTimes(1)
    expect(getSiriStopHitTimesAsync).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })

    // Wait for the dependent hits query to run after stops are updated.
    await vi.waitFor(
      () => {
        expect(getGtfsStopHitTimesAsync).toHaveBeenCalledTimes(2)
        expect(getSiriStopHitTimesAsync).toHaveBeenCalledTimes(2)
      },
      { timeout: 1000, interval: 10 },
    )

    const lastGtfsRequest = vi.mocked(getGtfsStopHitTimesAsync).mock.lastCall
    const lastSiriRequest = vi.mocked(getSiriStopHitTimesAsync).mock.lastCall

    expect(lastGtfsRequest?.[1].format('HH:mm')).toBe('06:50')
    expect(lastSiriRequest?.[2].format('HH:mm')).toBe('06:50')
  })
})

it('fetches stop hit times only after the debounce delay', async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  // Provide a selected stop so that hitsQuery can run.
  const stop = {
    key: 'stop-1',
    stopId: 12345,
  } as unknown as Awaited<ReturnType<typeof getStopsForRouteAsync>>[number]

  vi.mocked(getStopsForRouteAsync).mockResolvedValue([stop])
  vi.mocked(getGtfsStopHitTimesAsync).mockResolvedValue([])
  vi.mocked(getSiriStopHitTimesAsync).mockResolvedValue([])

  render(
    <QueryClientProvider client={queryClient}>
      <GlobalSearchContext.Provider
        value={{
          search: { ...search, stopKey: 'stop-1' },
          setSearch: vi.fn(),
        }}>
        <StationStopsPage />
      </GlobalSearchContext.Provider>
    </QueryClientProvider>,
  )

  // Wait for the initial hit-time requests to complete.
  await waitFor(() => {
    expect(getGtfsStopHitTimesAsync).toHaveBeenCalledTimes(1)
    expect(getSiriStopHitTimesAsync).toHaveBeenCalledTimes(1)
  })

  vi.useFakeTimers()

  const timeInput = screen.getByRole('textbox', { name: 'Time' })

  // Simulate multiple time changes within the debounce window.
  fireEvent.change(timeInput, { target: { value: '06:05' } })
  fireEvent.change(timeInput, { target: { value: '06:50' } })

  // Neither API should fetch data for intermediate time values.
  expect(getGtfsStopHitTimesAsync).toHaveBeenCalledTimes(1)
  expect(getSiriStopHitTimesAsync).toHaveBeenCalledTimes(1)

  act(() => {
    vi.advanceTimersByTime(499)
  })

  expect(getGtfsStopHitTimesAsync).toHaveBeenCalledTimes(1)
  expect(getSiriStopHitTimesAsync).toHaveBeenCalledTimes(1)

  act(() => {
    vi.advanceTimersByTime(1)
  })

  // Wait for the dependent hits query to run after stops are updated.
  await vi.waitFor(
    () => {
      expect(getGtfsStopHitTimesAsync).toHaveBeenCalledTimes(2)
      expect(getSiriStopHitTimesAsync).toHaveBeenCalledTimes(2)
    },
    { timeout: 1000, interval: 10 },
  )

  const lastGtfsRequest = vi.mocked(getGtfsStopHitTimesAsync).mock.lastCall
  const lastSiriRequest = vi.mocked(getSiriStopHitTimesAsync).mock.lastCall

  expect(lastGtfsRequest?.[1].format('HH:mm')).toBe('06:50')
  expect(lastSiriRequest?.[2].format('HH:mm')).toBe('06:50')
})

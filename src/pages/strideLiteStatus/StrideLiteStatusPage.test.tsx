import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { StrideLiteStatusPage } from './StrideLiteStatusPage'

vi.mock('recharts', async () => {
  const original = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...original,
    ResponsiveContainer: vi.fn().mockImplementation(({ children }: { children: ReactElement }) => (
      <original.ResponsiveContainer height={240} aspect={1}>
        {children}
      </original.ResponsiveContainer>
    )),
  }
})

const STATUS = {
  newest_snapshot: '2026/11/07/08/13',
  vehicle_locations: 1_234_567_890,
  newest_gtfs_date: '2026-11-06',
  refresh_tasks: 27,
  refresh_tasks_failing: 0,
}

const coverageDay = (day: string, overrides: Record<string, number> = {}) => ({
  day,
  snapshots: 1430,
  vehicle_locations: 7_500_000,
  duplicate_ids: 0,
  rides: 60_000,
  rides_with_duration: 59_000,
  rides_linked_to_gtfs: 59_500,
  measured_at: `${day}T02:00:00Z`,
  ...overrides,
})

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <StrideLiteStatusPage />
    </QueryClientProvider>,
  )

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('StrideLiteStatusPage', () => {
  test('says the experimental API is unconfigured instead of showing numbers', async () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderPage()

    expect(await screen.findByText('The experimental API is not configured')).toBeInTheDocument()
    expect(screen.queryByText('Newest snapshot (archive path)')).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('renders the status tiles and flags only the real faults', async () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example/')
    const coverage = [
      // Saturday — a sixth of a weekday is Shabbat, not a fault.
      coverageDay('2026-11-07', { vehicle_locations: 1_240_000 }),
      // Friday — about half a weekday, also not a fault.
      coverageDay('2026-11-06', { vehicle_locations: 3_700_000 }),
      coverageDay('2026-11-05', { duplicate_ids: 12 }),
      coverageDay('2026-11-04'),
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(url.includes('/coverage') ? coverage : STATUS),
        }),
      ),
    )

    renderPage()

    expect(await screen.findByText('2026/11/07/08/13')).toBeInTheDocument()
    expect(await screen.findByText('Days that need a look')).toBeInTheDocument()

    const faults = within(await screen.findByRole('table'))
    expect(faults.getByText('Pipeline fault')).toBeInTheDocument()
    expect(faults.getByText('05/11/2026')).toBeInTheDocument()
    // The Shabbat days are healthy, so they stay out of the fault table.
    expect(faults.queryByText('07/11/2026')).not.toBeInTheDocument()
    expect(faults.queryByText('06/11/2026')).not.toBeInTheDocument()
  })

  test('says it cannot reach the backend rather than rendering zeros', async () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 502, statusText: 'Bad Gateway', json: () => ({}) }),
      ),
    )

    renderPage()

    // Both sections report the failure: the status tiles and the coverage charts.
    await waitFor(() =>
      expect(screen.getAllByText('Cannot reach the experimental API')).toHaveLength(2),
    )
    expect(await screen.findAllByText(/502 Bad Gateway/)).not.toHaveLength(0)
    expect(screen.queryByText('Days that need a look')).not.toBeInTheDocument()
  })

  test('rejects a malformed payload instead of charting it', async () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () =>
            Promise.resolve(
              url.includes('/coverage')
                ? [{ ...coverageDay('2026-11-04'), snapshots: null }]
                : STATUS,
            ),
        }),
      ),
    )

    renderPage()

    expect(await screen.findByText(/non-numeric "snapshots"/)).toBeInTheDocument()
    expect(screen.queryByText('Days that need a look')).not.toBeInTheDocument()
  })
})

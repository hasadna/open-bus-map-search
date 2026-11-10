import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StrideLiteStatusPage />
      </LocalizationProvider>
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
      // Not linked to GTFS: the backend does not link yet, so this is not a fault.
      coverageDay('2026-11-04', { rides_linked_to_gtfs: 0 }),
      coverageDay('2026-11-03', { snapshots: 1116 }),
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
    expect(faults.getByText(/12 vehicle-location ids are used more than once/)).toBeInTheDocument()
    expect(faults.getByText(/314 of the day/)).toBeInTheDocument()
    expect(faults.queryByText('04/11/2026')).not.toBeInTheDocument()
    // The Shabbat days are healthy, so they stay out of the fault table.
    expect(faults.queryByText('07/11/2026')).not.toBeInTheDocument()
    expect(faults.queryByText('06/11/2026')).not.toBeInTheDocument()
  })

  test('shows the newest 90 days, and an older fault once the range reaches it', async () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    const coverage = [
      coverageDay('2026-11-07', { vehicle_locations: 1_240_000 }),
      coverageDay('2026-11-04'),
      // More than 90 days before the newest day.
      coverageDay('2026-07-01', { duplicate_ids: 5 }),
    ]
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(url.includes('/coverage') ? coverage : STATUS),
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderPage()

    expect(await screen.findByText('No faults found in the 2 days shown.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/coverage?limit=10000'))

    const startSections = within(screen.getByRole('group', { name: 'start' })).getAllByRole(
      'spinbutton',
    )
    act(() => startSections[0].focus())
    for (const digit of '01072026') {
      fireEvent.input(document.activeElement!, { target: { textContent: digit } })
    }

    const faults = within(await screen.findByRole('table'))
    expect(faults.getByText('01/07/2026')).toBeInTheDocument()
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

  test('shows the server and its logs, and warns when the disk runs low', async () => {
    vi.stubEnv('VITE_STRIDE_LITE_API', 'https://stride-lite.example')
    const metrics = {
      measured_at: '2026-11-10T13:00:00.000Z',
      server: {
        version: '26.10.3.7',
        uptime_seconds: 17_594,
        MemoryResident: 1_273_872_384,
        OSMemoryTotal: 33_026_674_688,
        OSMemoryAvailable: 31_236_685_824,
        LoadAverage1: 5.6,
        LoadAverage15: 4.73,
      },
      disks: [{ name: 'default', free_space: 40e9, total_space: 368e9, unreserved_space: 40e9 }],
      tables: [
        { table: 'siri_vehicle_location', rows: 7_537_296_286, bytes_on_disk: 136e9, parts: 17 },
      ],
      refreshes: { error: 'query failed' },
      api_requests_last_hour: [
        {
          path: '/gtfs_routes/list',
          requests: 12,
          errors: 1,
          p50_ms: 40,
          p95_ms: 900,
          max_ms: 1200,
        },
        {
          path: '/wp-admin/setup.php',
          endpoint: false,
          requests: 4,
          errors: 0,
          p50_ms: 1,
          p95_ms: 1,
          max_ms: 1,
        },
        { path: 'other', endpoint: false, requests: 2, errors: 0, p50_ms: 1, p95_ms: 1, max_ms: 1 },
      ],
      errors_last_day: [],
    }
    const logs = { catchup: { lines: ['newest snapshot loaded: 2026/11/10/12/59'] } }
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () =>
            Promise.resolve(
              url.includes('/ops/metrics')
                ? metrics
                : url.includes('/ops/logs')
                  ? logs
                  : url.includes('/coverage')
                    ? [coverageDay('2026-11-07')]
                    : STATUS,
            ),
        }),
      ),
    )

    renderPage()

    expect(await screen.findByText(/Only 11% of the disk is free/)).toBeInTheDocument()
    expect(screen.getByText('siri_vehicle_location')).toBeInTheDocument()
    expect(screen.getByText('/gtfs_routes/list')).toBeInTheDocument()
    expect(screen.getByText('/wp-admin/setup.php')).toBeInTheDocument()
    expect(screen.getByText('(not an endpoint)')).toBeInTheDocument()
    expect(screen.getByText('All other addresses')).toBeInTheDocument()
    expect(screen.getByText('26.10.3.7')).toBeInTheDocument()
    expect(await screen.findByText('newest snapshot loaded: 2026/11/10/12/59')).toBeInTheDocument()
  })
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { cloneElement, type ReactElement } from 'react'
import { civilDate } from 'src/model/time/civilDate'
import EarlyDeparturesChart from './EarlyDeparturesChart'

vi.mock('recharts', async () => {
  const original = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...original,
    // jsdom lays nothing out, so a measuring container would hand the chart a 0×0 box.
    ResponsiveContainer: ({
      children,
    }: {
      children: ReactElement<{ width?: number; height?: number }>
    }) => cloneElement(children, { width: 800, height: 300 }),
  }
})

const INDEX = {
  days: [
    { d: '2026-11-01', o: [3, 990, 4, 2, 1] },
    { d: '2026-11-02', o: [5, 990, 3, 1, 1] },
  ],
}

const renderChart = (startDate: string, endDate: string) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <EarlyDeparturesChart startDate={civilDate(startDate)!} endDate={civilDate(endDate)!} />
    </QueryClientProvider>,
  )

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(Response.json(INDEX))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('EarlyDeparturesChart', () => {
  it('sums the early departures of the selected days', async () => {
    renderChart('2026-11-01', '2026-11-02')

    expect(
      await screen.findByText('8 of 2,000 measured departures (0.4%) left early'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/publishes data only from/)).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://kavbochan.app/bus/data/index.json',
      expect.anything(),
    )
  })

  it('says so when the range reaches past the published days', async () => {
    renderChart('2026-10-30', '2026-11-01')

    expect(
      await screen.findByText('3 of 1,000 measured departures (0.3%) left early'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'kavbochan.app publishes data only from 01/11/26 to 02/11/26, so the summary covers only those days.',
      ),
    ).toBeInTheDocument()
  })

  it('points at the published days when the range has none of them', async () => {
    renderChart('2026-10-01', '2026-10-07')

    expect(
      await screen.findByText(
        'No data for the selected dates. kavbochan.app publishes data from 01/11/26 to 02/11/26.',
      ),
    ).toBeInTheDocument()
  })

  it('keeps the failure inside the card when the source is unreachable', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 503 }))
    renderChart('2026-11-01', '2026-11-02')

    expect(
      await screen.findByText(
        'Could not load the data from kavbochan.app. The rest of this page is not affected.',
      ),
    ).toBeInTheDocument()
  })

  it('credits the source', () => {
    renderChart('2026-11-01', '2026-11-02')

    expect(screen.getByRole('link', { name: 'kavbochan.app' })).toHaveAttribute(
      'href',
      'https://kavbochan.app/bus/',
    )
  })
})

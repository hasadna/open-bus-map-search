import { render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import type { BusRoute } from 'src/model/busRoute'
import { type PageSearchState, SearchContext } from 'src/model/pageState'
import { getRoutesAsync } from '../../api/gtfsService'
import GapsPatternsPage from './GapsPatternsPage'

// Exercises the fix: when the route fetch fails (non-AbortError), stale routes
// from the previously selected line must be cleared so they aren't shown as if
// they belong to the failed search.
jest.mock('../../api/gtfsService', () => ({
  getRoutesAsync: jest.fn(),
}))
// Trim heavy/irrelevant children so the test isolates the load effect.
jest.mock('./useGapsList', () => ({ useGapsList: () => [] }))
jest.mock('../components/YoutubeModal', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/DateSelector', () => ({
  __esModule: true,
  DateSelector: () => null,
}))
jest.mock('../components/LineSelector', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/OperatorSelector', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/RouteSelector', () => ({ __esModule: true, default: () => null }))

const getRoutesMock = getRoutesAsync as jest.Mock

function Harness() {
  const [search, setSearch] = useState<PageSearchState>({
    timestamp: new Date('2024-01-01T08:00:00Z').valueOf(),
    operatorId: '3',
    lineNumber: '18',
    routeKey: 'stale-route',
    routes: [{ key: 'stale-route' } as BusRoute],
  })
  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <div data-testid="routes-state">
        {search.routes === undefined ? 'cleared' : `count:${search.routes.length}`}
      </div>
      <GapsPatternsPage />
    </SearchContext.Provider>
  )
}

describe('GapsPatternsPage - failed route fetch clears stale routes', () => {
  beforeEach(() => {
    getRoutesMock.mockReset()
  })

  it('clears the previous line routes/routeKey when the fetch fails', async () => {
    getRoutesMock.mockRejectedValue(new Error('500 from gtfs'))

    render(<Harness />)
    expect(screen.getByTestId('routes-state')).toHaveTextContent('count:1')

    // The load effect runs, getRoutesAsync rejects (non-abort), and the catch
    // must clear the stale routes instead of leaving them rendered as valid.
    await waitFor(() => expect(screen.getByTestId('routes-state')).toHaveTextContent('cleared'), {
      timeout: 8000,
    })
  }, 15000)
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import type { BusRoute } from 'src/model/busRoute'
import {
  GLOBAL_SEARCH_DEFAULTS,
  GlobalSearchContext,
  type GlobalSearchState,
} from 'src/model/globalState'
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
// Routes now live in the page's local state; the selector is the observable output.
jest.mock('../components/RouteSelector', () => ({
  __esModule: true,
  default: ({ routes }: { routes: BusRoute[] }) => (
    <div data-testid="route-selector">count:{routes.length}</div>
  ),
}))

const getRoutesMock = getRoutesAsync as jest.Mock

function Harness() {
  const [search, setSearch] = useState<GlobalSearchState>({
    ...GLOBAL_SEARCH_DEFAULTS,
    operatorId: '3',
    lineNumber: '18',
    routeKey: 'stale-route',
  })
  return (
    <GlobalSearchContext.Provider value={{ search, setSearch }}>
      <div data-testid="route-key">{search.routeKey ?? 'cleared'}</div>
      <button
        data-testid="switch-line"
        onClick={() => setSearch((current) => ({ ...current, lineNumber: '99' }))}
      />
      <GapsPatternsPage />
    </GlobalSearchContext.Provider>
  )
}

describe('GapsPatternsPage - failed route fetch clears stale routes', () => {
  beforeEach(() => {
    getRoutesMock.mockReset()
  })

  it('clears the previous line routes/routeKey when the fetch fails', async () => {
    getRoutesMock.mockResolvedValueOnce([{ key: 'stale-route' } as BusRoute])
    getRoutesMock.mockRejectedValueOnce(new Error('500 from gtfs'))

    render(<Harness />)
    // First line loads fine and its routes render.
    await waitFor(() => expect(screen.getByTestId('route-selector')).toHaveTextContent('count:1'), {
      timeout: 8000,
    })

    // Switching lines reruns the load effect; getRoutesAsync rejects (non-abort),
    // and the catch must clear the stale routes/routeKey instead of leaving the
    // previous line's routes rendered as valid.
    fireEvent.click(screen.getByTestId('switch-line'))
    await waitFor(() => expect(screen.getByTestId('route-key')).toHaveTextContent('cleared'), {
      timeout: 8000,
    })
    expect(screen.queryByTestId('route-selector')).not.toBeInTheDocument()
  }, 15000)
})

import { act, fireEvent, render, screen } from '@testing-library/react'
import { useAllRoutes } from 'src/hooks/useAllRoutes'
import LineSelector from './LineSelector'

// Keep the real API client / gtfsService out of the test: LineSelector only
// reads `line` and `suffix` off each route, so a mocked hook is enough.
jest.mock('src/hooks/useAllRoutes')
const mockUseAllRoutes = jest.mocked(useAllRoutes)

type RouteItem = ReturnType<typeof useAllRoutes>['routes'][number]

const route = (line: number, suffix = ''): RouteItem => ({
  id: line,
  line,
  suffix,
  start: 'start',
  end: 'end',
  routeKey: `${line}${suffix}-key`,
})

// useAllRoutes already returns routes sorted by line number; mirror that here.
const setRoutes = (routes: RouteItem[], isLoading = false) =>
  mockUseAllRoutes.mockReturnValue({ routes, isLoading, error: false })

const renderSelector = (props: Partial<React.ComponentProps<typeof LineSelector>> = {}) =>
  render(
    <LineSelector
      operatorId="3"
      date="2026-07-01"
      lineNumber={undefined}
      setLineNumber={jest.fn()}
      {...props}
    />,
  )

beforeEach(() => {
  setRoutes([])
})

afterEach(() => {
  jest.useRealTimers()
})

describe('LineSelector', () => {
  it('offers the distinct line numbers running for the operator + date, in order', () => {
    setRoutes([route(1), route(5), route(5), route(18), route(18, 'א')])
    renderSelector()

    fireEvent.click(screen.getByRole('button', { name: /open/i }))

    // The two direction rows of line 5 collapse to a single option.
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['1', '5', '18', '18א'])
  })

  it('commits the line number when an option is picked', () => {
    setRoutes([route(18), route(18, 'א'), route(480)])
    const setLineNumber = jest.fn()
    renderSelector({ setLineNumber })

    fireEvent.click(screen.getByRole('button', { name: /open/i }))
    fireEvent.click(screen.getByRole('option', { name: '480' }))

    expect(setLineNumber).toHaveBeenCalledWith('480')
  })

  it('commits a freely typed line number after the debounce (does not restrict to options)', () => {
    jest.useFakeTimers()
    const setLineNumber = jest.fn()
    setRoutes([route(1)])
    renderSelector({ setLineNumber })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '42' } })
    expect(setLineNumber).not.toHaveBeenCalled() // debounced, not immediate

    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(setLineNumber).toHaveBeenCalledWith('42')
  })

  it('renders as a standard Autocomplete with the dropdown arrow (appearance parity guard)', () => {
    setRoutes([route(1)])
    renderSelector()

    // `MuiAutocomplete-inputRoot` carries the compact vertical padding that keeps
    // this field the same height as the other selectors — its absence was the
    // 74px-vs-56px regression. `forcePopupIcon` keeps the dropdown arrow so it
    // looks like OperatorSelector / RouteSelector rather than a bare text field.
    expect(screen.getByRole('combobox').closest('.MuiAutocomplete-inputRoot')).not.toBeNull()
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument()
  })

  it('tags the clear button with the `clear-indicator` class the e2e helper relies on', () => {
    // The `clearInputField` Playwright helper (clearButton.spec.ts) finds the
    // clear button by the repo-wide `.clear-indicator` class. MUI's built-in
    // clear indicator only renders once the field has a value to clear.
    setRoutes([route(5)])
    renderSelector({ lineNumber: '5' })

    expect(document.querySelector('.clear-indicator')).not.toBeNull()
  })
})

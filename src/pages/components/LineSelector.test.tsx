import { act, fireEvent, render, screen } from '@testing-library/react'
import { useAllRoutes } from 'src/hooks/useAllRoutes'
import i18n from 'src/locale/allTranslations'
import LineSelector from './LineSelector'

vi.mock('src/hooks/useAllRoutes', () => ({ useAllRoutes: vi.fn() }))
const mockUseAllRoutes = vi.mocked(useAllRoutes)

const LINE_LABEL = i18n.t('choose_line')
const OPEN_BUTTON = /open/i
const AUTOCOMPLETE_INPUT_ROOT = '.MuiAutocomplete-inputRoot'
const CLEAR_INDICATOR = '.clear-indicator'
const DEBOUNCE_MS = 500

type RouteItem = ReturnType<typeof useAllRoutes>['routes'][number]

const route = (line: number, suffix = ''): RouteItem => ({
  id: line,
  lineRef: line,
  line,
  suffix,
  start: 'start',
  end: 'end',
  routeKey: `${line}${suffix}-key`,
})

const setRoutes = (routes: RouteItem[], isLoading = false) =>
  mockUseAllRoutes.mockReturnValue({ routes, isLoading, error: false })

const renderSelector = (props: Partial<React.ComponentProps<typeof LineSelector>> = {}) =>
  render(
    <LineSelector
      operatorId="3"
      date="2026-07-01"
      lineNumber={undefined}
      setLineNumber={vi.fn()}
      {...props}
    />,
  )

beforeEach(() => {
  setRoutes([])
})

afterEach(() => {
  vi.useRealTimers()
})

describe('LineSelector', () => {
  it('offers the distinct line numbers running for the operator + date, in order', () => {
    setRoutes([route(1), route(5), route(5), route(18), route(18, 'א')])
    renderSelector()

    fireEvent.click(screen.getByRole('button', { name: OPEN_BUTTON }))

    // The two direction rows of line 5 collapse to a single option.
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['1', '5', '18', '18א'])
  })

  it('commits the line number when an option is picked', () => {
    setRoutes([route(18), route(18, 'א'), route(480)])
    const setLineNumber = vi.fn()
    renderSelector({ setLineNumber })

    fireEvent.click(screen.getByRole('button', { name: OPEN_BUTTON }))
    fireEvent.click(screen.getByRole('option', { name: '480' }))

    expect(setLineNumber).toHaveBeenCalledWith('480')
  })

  it('commits a freely typed line number after the debounce (does not restrict to options)', () => {
    vi.useFakeTimers()
    const setLineNumber = vi.fn()
    setRoutes([route(1)])
    renderSelector({ setLineNumber })

    fireEvent.change(screen.getByRole('combobox', { name: LINE_LABEL }), {
      target: { value: '42' },
    })
    expect(setLineNumber).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS)
    })
    expect(setLineNumber).toHaveBeenCalledWith('42')
  })

  it('renders as a standard Autocomplete with the dropdown arrow (appearance parity guard)', () => {
    setRoutes([route(1)])
    renderSelector()

    // `MuiAutocomplete-inputRoot` keeps this field the same height as the other selectors.
    expect(
      screen.getByRole('combobox', { name: LINE_LABEL }).closest(AUTOCOMPLETE_INPUT_ROOT),
    ).not.toBeNull()
    expect(screen.getByRole('button', { name: OPEN_BUTTON })).toBeInTheDocument()
  })

  it('tags the clear button with the `clear-indicator` class the e2e helper relies on', () => {
    // MUI only renders its clear indicator once the field has a value to clear.
    setRoutes([route(5)])
    renderSelector({ lineNumber: '5' })

    expect(document.querySelector(CLEAR_INDICATOR)).not.toBeNull()
  })
})

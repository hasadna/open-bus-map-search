import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import dayjs from 'src/dayjs'
import { SearchContext, type PageSearchState } from 'src/model/pageState'
import SingleLineMapPage from '.'

jest.mock('src/hooks/useSingleLineData', () => ({
  useSingleLineData: jest.fn(() => ({
    positions: undefined,
    locationsAreLoading: false,
    options: [],
    plannedRouteStops: undefined,
    startTime: undefined,
    routes: undefined,
    routeKey: undefined,
    setStartTime: jest.fn(),
    setRouteKey: jest.fn(),
  })),
}))

jest.mock('../components/DateSelector', () => ({
  DateSelector: () => <div data-testid="date-selector" />,
}))

jest.mock('src/pages/components/OperatorSelector', () => ({
  __esModule: true,
  default: () => <div data-testid="operator-selector" />,
}))

jest.mock('src/pages/components/LineSelector', () => ({
  __esModule: true,
  default: () => <div data-testid="line-selector" />,
}))

jest.mock('src/pages/components/RouteSelector', () => ({
  __esModule: true,
  default: () => <div data-testid="route-selector" />,
}))

jest.mock('../components/map-related/MapWithLocationsAndPath', () => ({
  MapWithLocationsAndPath: () => <div data-testid="map" />,
}))

jest.mock('../components/YoutubeModal', () => ({
  __esModule: true,
  default: () => <div data-testid="youtube-modal" />,
}))

const renderSingleLineMapPage = () => {
  const StateWrapper = () => {
    const [search, setSearch] = useState<PageSearchState>({
      timestamp: dayjs('2026-05-11').valueOf(),
      operatorId: '3',
    })

    return (
      <SearchContext.Provider value={{ search, setSearch }}>
        <SingleLineMapPage />
        <div data-testid="vehicle-number-state">{search.vehicleNumber}</div>
      </SearchContext.Provider>
    )
  }

  render(<StateWrapper />)
}

describe('SingleLineMapPage', () => {
  it.each([
    ['123:12:123', '12312123'],
    ['12:123:12', '1212312'],
  ])('normalizes colon-separated vehicle number %s', async (inputValue, expectedValue) => {
    renderSingleLineMapPage()

    fireEvent.click(screen.getByRole('button', { name: 'By Vehicle ID' }))
    fireEvent.change(screen.getByLabelText('Vehicle number'), {
      target: { value: inputValue },
    })

    expect(screen.getByLabelText('Vehicle number')).toHaveValue(expectedValue)
    await waitFor(() =>
      expect(screen.getByTestId('vehicle-number-state')).toHaveTextContent(expectedValue),
    )
  })
})

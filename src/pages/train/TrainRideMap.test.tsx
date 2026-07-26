import { fireEvent, render, screen } from '@testing-library/react'
import i18n from 'src/locale/allTranslations'
import type { MapProps } from 'src/pages/components/map-related/map-types'
import { TrainRideCard } from './index'
import type { TrainRideData } from './trainData'

jest.mock('src/pages/components/map-related/MapWithLocationsAndPath', () => ({
  MapWithLocationsAndPath: ({ positionGroups, plannedRouteStops }: MapProps) => (
    <div
      data-testid="ride-map"
      data-position-count={positionGroups[0]?.positions.length ?? 0}
      data-station-count={plannedRouteStops?.length ?? 0}
    />
  ),
}))

jest.mock('./TrainRideTimeline', () => ({
  TrainRideTimeline: () => null,
}))

const ride: TrainRideData = {
  rideId: 7,
  vehicleRef: '1234567',
  locations: [{ id: 1, lat: 32.1, lon: 34.8 }],
  stops: [{ id: 2, gtfsStopLat: 32.2, gtfsStopLon: 34.9 }],
}

describe('TrainRideCard', () => {
  it('opens and closes the current ride map', () => {
    render(<TrainRideCard ride={ride} />)

    const showButton = screen.getByRole('button', { name: i18n.t('train_show_ride_map') })
    expect(showButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId('ride-map')).not.toBeInTheDocument()

    fireEvent.click(showButton)

    const map = screen.getByTestId('ride-map')
    expect(map).toHaveAttribute('data-position-count', '1')
    expect(map).toHaveAttribute('data-station-count', '1')
    const hideButton = screen.getByRole('button', { name: i18n.t('train_hide_ride_map') })
    expect(hideButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(hideButton)
    expect(screen.queryByTestId('ride-map')).not.toBeInTheDocument()
  })
})

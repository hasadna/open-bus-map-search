import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { PositionGroup } from '../map-types'
import { MapIndexLayer } from './MapIndexLayer'

// MapContent computes marker paths from import.meta.env, which ts-jest can't parse.
// MapIndexLayer only needs the path/color constants, so stub them.
jest.mock('../MapContent', () => ({
  actualRouteStopMarkerPath: 'actual-marker.png',
  plannedRouteStopMarkerPath: 'planned-marker.png',
  plannedRouteLineColor: 'black',
}))

const group = (overrides: Partial<PositionGroup>): PositionGroup => ({
  positions: [],
  color: '#ff0000',
  ...overrides,
})

const renderLayer = (props: Parameters<typeof MapIndexLayer>[0]) =>
  render(
    <MemoryRouter>
      <MapIndexLayer {...props} />
    </MemoryRouter>,
  )

describe('MapIndexLayer', () => {
  it('deep-links the legend vehicle number to the vehicle page when the ride has a vehicle ref', () => {
    renderLayer({
      showPlannedRoute: false,
      positionGroups: [group({ label: '12-345-67', vehicleRef: '1234567' })],
    })

    const link = screen.getByRole('link', { name: '12-345-67' })
    expect(link).toHaveAttribute('href', '/vehicle?vehicleNumber=1234567')
    // the number stays bracketed in the legend
    expect(link.closest('bdi')).toHaveTextContent('(12-345-67)')
  })

  it('renders the vehicle number as plain bracketed text (no link) when no vehicle ref is known', () => {
    renderLayer({
      showPlannedRoute: false,
      positionGroups: [group({ label: '99', vehicleRef: undefined })],
    })

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('(', { exact: false }).closest('bdi')).toHaveTextContent('(99)')
  })

  it('renders one actual-route legend row per position group', () => {
    const { container } = renderLayer({
      showPlannedRoute: false,
      positionGroups: [
        group({ label: '12-345-67', vehicleRef: '1234567' }),
        group({ label: '76-543-21', vehicleRef: '7654321', color: '#00ff00' }),
      ],
    })

    expect(container.querySelectorAll('.map-index-item')).toHaveLength(2)
    expect(screen.getByRole('link', { name: '12-345-67' })).toHaveAttribute(
      'href',
      '/vehicle?vehicleNumber=1234567',
    )
    expect(screen.getByRole('link', { name: '76-543-21' })).toHaveAttribute(
      'href',
      '/vehicle?vehicleNumber=7654321',
    )
  })

  it('shows the planned-route row before any ride is selected, and adds the actual row only once groups arrive', () => {
    const { container, rerender } = renderLayer({ showPlannedRoute: true, positionGroups: [] })
    // only the planned route, no actual-route legend yet
    expect(container.querySelectorAll('.map-index-item')).toHaveLength(1)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <MapIndexLayer
          showPlannedRoute
          positionGroups={[group({ label: '12-345-67', vehicleRef: '1234567' })]}
        />
      </MemoryRouter>,
    )
    expect(container.querySelectorAll('.map-index-item')).toHaveLength(2)
  })

  it('omits the subtitle entirely when a group has no label', () => {
    renderLayer({ showPlannedRoute: false, positionGroups: [group({ label: undefined })] })

    const item = document.querySelector('.map-index-item')!
    // title present, but no parenthesised subtitle span
    expect(within(item as HTMLElement).queryByText('(', { exact: false })).not.toBeInTheDocument()
  })
})

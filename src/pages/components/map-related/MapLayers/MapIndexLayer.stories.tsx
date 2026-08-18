import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapIndexLayer } from './MapIndexLayer'
import 'src/resources/map.scss'

// The map legend. Once a ride is selected, each actual-route row shows the vehicle
// number in brackets; when the ride's raw vehicle ref is known the number deep-links
// to the /vehicle page. These stories pin that legend visually (incl. the RTL
// bracket handling and the linked-vs-plain subtitle).
const meta = {
  title: 'Map/Layers/MapIndexLayer',
  component: MapIndexLayer,
  parameters: { layout: 'centered' },
  // Every legend rule in map.scss is nested under `.map-info` — the wrapper MapShell puts round
  // a map page — and the box chrome comes from the `.map-legend` slot inside it. Mounted bare,
  // the legend gets none of it: the grid never applies and the glyphs render at their intrinsic
  // size rather than 20px. So the decorator reproduces MapShell's two levels, and the wrapper is
  // given a map-sized box because `.map-legend` is absolutely positioned within it.
  decorators: [
    (Story) => (
      <div className="map-info" style={{ width: 340, height: 210 }}>
        <div className="map-legend">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof MapIndexLayer>

export default meta

type Story = StoryObj<typeof meta>

export const MultipleVehiclesLinked: Story = {
  args: {
    showPlannedRoute: true,
    positionGroups: [
      { positions: [], color: 'orange', label: '12-345-67', vehicleRef: '1234567' },
      { positions: [], color: '#1f78b4', label: '76-543-21', vehicleRef: '7654321' },
    ],
  },
}

export const SingleVehicleLinked: Story = {
  args: {
    showPlannedRoute: true,
    positionGroups: [{ positions: [], color: 'orange', label: '12-345-67', vehicleRef: '1234567' }],
  },
}

// No raw vehicle ref → the number is plain bracketed text, not a link.
export const VehicleWithoutRef: Story = {
  args: {
    showPlannedRoute: true,
    positionGroups: [{ positions: [], color: 'orange', label: '12-345-67' }],
  },
}

// Before a ride is selected, the legend shows only the planned route.
export const PlannedRouteOnly: Story = {
  args: { showPlannedRoute: true, positionGroups: [] },
}

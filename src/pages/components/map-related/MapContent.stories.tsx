import type { Meta, StoryObj } from '@storybook/react'
import { MapContainer } from 'react-leaflet'
import { MapContent } from './MapContent'
import { filteredPositions, plannedRouteStops } from './mapStorybookData'

const meta = {
  component: MapContent,
  title: 'Map/MapContent',
  decorators: [
    (Story) => {
      return (
        <div className="map-info">
          <MapContainer center={[32.3057988, 34.85478613]} zoom={13} scrollWheelZoom={false}>
            <Story />
          </MapContainer>
        </div>
      )
    },
  ],
  args: {
    plannedRouteStops: [],
    positions: [],
    showNavigationButtons: true,
  },
  argTypes: {
    positions: {
      control: false,
      table: {
        type: { detail: '', summary: 'Point[]' },
      },
    },
    plannedRouteStops: {
      control: false,
      table: {
        type: { detail: '', summary: 'BusStop[]' },
      },
    },
    showNavigationButtons: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof MapContent>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WhitData: Story = {
  args: {
    plannedRouteStops: plannedRouteStops,
    positions: filteredPositions,
  },
}

import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapContainer } from 'react-leaflet'
import { MapContent } from './MapContent'
import { plannedRouteStops, positionGroups } from './mapStorybookData'

const meta = {
  component: MapContent,
  title: 'Map/MapContent',
  parameters: {
    eyes: {
      waitBeforeCapture: 15000,
    },
  },
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
    positionGroups: [],
    showNavigationButtons: true,
  },
  argTypes: {
    positionGroups: {
      control: false,
      table: {
        type: { summary: 'PositionGroup[]' },
      },
    },
    plannedRouteStops: {
      control: false,
      table: {
        type: { summary: 'BusStop[]' },
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
    positionGroups: positionGroups,
  },
}

import type { Meta, StoryObj } from '@storybook/react-vite'
import { filteredPositions, plannedRouteStops } from './mapStorybookData'
import { MapWithLocationsAndPath } from './MapWithLocationsAndPath'

const meta = {
  component: MapWithLocationsAndPath,
  title: 'Map/MapWithLocationsAndPath',
  parameters: {
    eyes: {
      waitBeforeCapture: 15000,
    },
  },
  args: {
    plannedRouteStops: [],
    positions: [],
    showNavigationButtons: true,
  },
  argTypes: {
    positions: {
      control: false,
      table: {
        type: { summary: 'Point[]' },
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
} satisfies Meta<typeof MapWithLocationsAndPath>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WhitData: Story = {
  args: {
    plannedRouteStops: plannedRouteStops,
    positions: filteredPositions,
  },
}

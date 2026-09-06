import type { Meta, StoryObj } from '@storybook/react-vite'
import { plannedRouteStops, positionGroups } from './mapStorybookData'
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
} satisfies Meta<typeof MapWithLocationsAndPath>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WhitData: Story = {
  args: {
    plannedRouteStops: plannedRouteStops,
    positionGroups: positionGroups,
  },
}

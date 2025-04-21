import type { Meta, StoryObj } from '@storybook/react'
import { MapWithLocationsAndPath } from './MapWithLocationsAndPath'
import { filteredPositions, plannedRouteStops } from './mapStorybookData'

const meta = {
  component: MapWithLocationsAndPath,
  title: 'Map/MapWithLocationsAndPath',
  tags: ['autodocs'],
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

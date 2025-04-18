import type { Meta, StoryObj } from '@storybook/react'

import { MapWithLocationsAndPath } from './MapWithLocationsAndPath'

const meta = {
  component: MapWithLocationsAndPath,
  title: 'Map/MapWithLocationsAndPath',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    plannedRouteStops: [],
    positions: [],
    showNavigationButtons: true,
  },
  decorators: [
    (Story) => {
      return (
        <div style={{ height: '100%', width: '100%', minWidth: 500, position: 'relative' }}>
          <Story />
        </div>
      )
    },
  ],
  argTypes: {
    positions: {
      control: 'object',
    },
    plannedRouteStops: {
      control: 'object',
    },
    showNavigationButtons: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof MapWithLocationsAndPath>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

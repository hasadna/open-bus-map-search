import type { Meta, StoryObj } from '@storybook/react'
import { MapContainer } from 'react-leaflet'
import { MapContent } from './MapContent'

const meta = {
  component: MapContent,
  title: 'Map/MapContent',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return (
        <div style={{ height: '100%', width: '100%', minWidth: 500, position: 'relative' }}>
          <MapContainer center={[32.3057988, 34.85478613]} zoom={13} scrollWheelZoom={true}>
            <Story />
          </MapContainer>
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
  args: {
    plannedRouteStops: [],
    positions: [],
    showNavigationButtons: true,
  },
} satisfies Meta<typeof MapContent>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

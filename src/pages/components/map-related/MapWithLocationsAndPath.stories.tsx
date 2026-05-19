import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
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
  parameters: {
    msw: {
      handlers: [
        http.get(
          (info) => new URL(info.request.url).pathname === '/gtfs_agencies/list',
          async () => {
            const { agencies } = await import('../../../../.storybook/mockData')
            return HttpResponse.json(agencies)
          },
        ),
      ],
    },
  },
  args: {
    plannedRouteStops: plannedRouteStops,
    positionGroups: positionGroups,
  },
}

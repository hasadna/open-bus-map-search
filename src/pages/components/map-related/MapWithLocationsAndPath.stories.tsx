import type { Meta, StoryObj } from '@storybook/react-vite'
import { mocked } from 'storybook/test'
import { getAgencyList } from 'src/api/agencyList'
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
  beforeEach: () => {
    mocked(getAgencyList).mockResolvedValue([
      { date: new Date('2024-02-11'), operatorRef: 3, agencyName: 'אגד' },
      { date: new Date('2024-02-11'), operatorRef: 5, agencyName: 'דן' },
      { date: new Date('2024-02-11'), operatorRef: 18, agencyName: 'קווים' },
    ])
  },
  args: {
    plannedRouteStops: plannedRouteStops,
    positionGroups: positionGroups,
  },
}

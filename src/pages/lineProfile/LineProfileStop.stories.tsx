import type { Meta, StoryObj } from '@storybook/react'

import { LineProfileStop } from './LineProfileStop'

const meta = {
  title: 'Pages/Profile/LineProfileStop',
  component: LineProfileStop,
  argTypes: {
    stop: {
      control: 'object',
      description: 'The stop of the line profile.',
      table: {
        type: { summary: 'BusStop' },
      },
    },
    total: {
      control: 'number',
      description: 'The total number of stops in the line profile.',
    },
  },
} satisfies Meta<typeof LineProfileStop>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stop: {
      date: new Date('Mon Feb 12 2024 02:00:00 GMT+0200 (Israel Standard Time)'),
      key: '2392591700',
      stopId: 21237009,
      routeId: 4335451,
      stopSequence: 20,
      name: 'יד לבנים/הירדן (חיפה)',
      code: '41276',
      location: { latitude: 32.799319, longitude: 35.012675 },
      minutesFromRouteStartTime: 23,
    },
    total: 40,
  },
}

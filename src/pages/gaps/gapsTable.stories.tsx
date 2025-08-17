import type { Meta, StoryObj } from '@storybook/react-vite'
import GapsTable from './GapsTable'
import dayjs from 'src/dayjs'
import { Gap } from 'src/api/gapsService'

const meta = {
  title: 'Components/GapsTable',
  component: GapsTable,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    gaps: {
      description: 'List of gap objects to display in the table',
      control: { type: 'object' },
      table: {
        type: { summary: 'RideExecutionPydanticModel[]' },
      },
    },
    loading: {
      description: 'Whether the table is in loading state',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
    initOnlyGapped: {
      description: 'Show only gapped rows initially',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
} satisfies Meta<typeof GapsTable>

export default meta

type Story = StoryObj<typeof meta>

const makeTime = (hours: number, minutes: number = 0) => {
  return dayjs().subtract(7, 'day').set('hour', hours).set('minutes', minutes)
}

const mockGaps: Gap[] = [
  {
    plannedStartTime: makeTime(13),
    actualStartTime: makeTime(13),
  },
  {
    plannedStartTime: undefined,
    actualStartTime: makeTime(13),
  },
  {
    plannedStartTime: makeTime(14),
    actualStartTime: undefined,
  },
  {
    plannedStartTime: undefined,
    actualStartTime: makeTime(14, 30),
  },
  {
    plannedStartTime: dayjs().add(1, 'day').set('hour', 15).set('minutes', 0),
    actualStartTime: undefined,
  },
]

export const Default: Story = {
  args: {
    gaps: mockGaps,
  },
}

export const OnlyGappe: Story = {
  args: {
    gaps: mockGaps,
    initOnlyGapped: true,
  },
}

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
const yesteday = dayjs().startOf('day').subtract(1, 'day')
const mockGaps: Gap[] = [
  {
    plannedStartTime: yesteday.set('hour', 13),
    actualStartTime: yesteday.set('hour', 13),
  },
  {
    plannedStartTime: undefined,
    actualStartTime: yesteday.set('hour', 13),
  },
  {
    plannedStartTime: yesteday.set('hour', 14),
    actualStartTime: undefined,
  },
  {
    plannedStartTime: undefined,
    actualStartTime: yesteday.set('hour', 14).set('minute', 30),
  },
  {
    plannedStartTime: yesteday.add(2, 'day').set('hour', 15),
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

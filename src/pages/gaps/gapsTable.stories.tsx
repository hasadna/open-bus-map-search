import type { Meta, StoryObj } from '@storybook/react-vite'
import { GapsList } from '../../model/gaps'
import GapsTable from './GapsTable'
import dayjs from 'src/dayjs'

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
        type: { summary: 'GapsList' },
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

const yestday = dayjs().startOf('day')

const mockGaps: GapsList = [
  { gtfsTime: yestday.set('hour', 8), siriTime: yestday.set('hour', 8) },
  { gtfsTime: null, siriTime: yestday.set('hour', 8) },
  { gtfsTime: yestday.set('hour', 9), siriTime: null },
  { gtfsTime: null, siriTime: yestday.set('hour', 10) },
  { gtfsTime: yestday.add(1, 'day').set('hour', 11), siriTime: null },
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

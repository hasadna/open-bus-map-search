import type { Meta, StoryObj } from '@storybook/react-vite'
import { Gap } from 'src/api/gapsService'
import { atTimeOfDay, serializeInstant, shiftIsraelDate, todayIsraelDate } from 'src/dayjs'
import GapsTable from './GapsTable'

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
const yesterday = shiftIsraelDate(todayIsraelDate(), -1)
const at = (date: string, time: string) => serializeInstant(atTimeOfDay(date, time))
const mockGaps: Gap[] = [
  {
    plannedStartTime: at(yesterday, '13:00'),
    actualStartTime: at(yesterday, '13:00'),
  },
  {
    plannedStartTime: undefined,
    actualStartTime: at(yesterday, '13:00'),
  },
  {
    plannedStartTime: at(yesterday, '14:00'),
    actualStartTime: undefined,
  },
  {
    plannedStartTime: undefined,
    actualStartTime: at(yesterday, '14:30'),
  },
  {
    plannedStartTime: at(shiftIsraelDate(yesterday, 2), '15:00'),
    actualStartTime: undefined,
  },
]

export const Default: Story = {
  args: {
    gaps: mockGaps,
    date: todayIsraelDate(),
    singleLineMapBaseHref:
      '/single-line-map?date=2025-01-01&operatorId=3&lineNumber=5&routeKey=10018-2',
  },
}

export const OnlyGappe: Story = {
  args: {
    gaps: mockGaps,
    date: todayIsraelDate(),
    initOnlyGapped: true,
    singleLineMapBaseHref:
      '/single-line-map?date=2025-01-01&operatorId=3&lineNumber=5&routeKey=10018-2',
  },
}

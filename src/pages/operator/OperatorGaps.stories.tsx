import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import * as groupByService from 'src/api/groupByService'
import { getPastDate } from '../../../.storybook/main'
import { OperatorGaps } from './OperatorGaps'

const meta = {
  component: OperatorGaps,
  title: 'Pages/Operator/OperatorGaps',
  argTypes: {
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
    timestamp: {
      control: 'date',
      description: 'The timestamp of the chart.',
    },
    timeRange: {
      control: 'select',
      description: 'The time range of the chart.',
      options: ['day', 'week', 'month'],
    },
  },
} satisfies Meta<typeof OperatorGaps>

export default meta

type Story = StoryObj<typeof meta>

const mockOperatorGapsData: groupByService.GroupByRes[] = [
  {
    operatorRef: { operatorRef: 3, agencyName: 'אגד' },
    totalPlannedRides: 24064,
    totalActualRides: 23386,
    totalRoutes: 10172,
  },
]

export const Default: Story = {
  args: {
    operatorId: '3',
    timestamp: getPastDate().getTime(),
    timeRange: 'day',
  },
  beforeEach: () => {
    vi.spyOn(groupByService, 'useGroupBy').mockReturnValue([mockOperatorGapsData, false])
    return () => {
      vi.restoreAllMocks()
    }
  },
}

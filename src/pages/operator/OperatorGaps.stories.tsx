import type { Meta, StoryObj } from '@storybook/react-vite'
import { mocked } from 'storybook/test'
import { useGroupBy } from 'src/api/groupByService'
import dayjs from 'src/dayjs'
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
    date: {
      control: 'text',
      description: 'The date of the chart (YYYY-MM-DD).',
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

export const Default: Story = {
  beforeEach: () => {
    mocked(useGroupBy).mockReturnValue([
      [
        {
          totalRoutes: 20235,
          totalPlannedRides: 47824,
          totalActualRides: 46939,
          operatorRef: {
            date: new Date('2024-02-11'),
            operatorRef: 3,
            agencyName: 'Egged',
          },
        },
      ],
      false,
      null,
    ])
  },
  args: {
    operatorId: '3',
    date: dayjs(getPastDate()).format('YYYY-MM-DD'),
    timeRange: 'day',
  },
}

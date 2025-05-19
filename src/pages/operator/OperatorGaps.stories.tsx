import type { Meta, StoryObj } from '@storybook/react'
import { getPastDate } from '../../../tests/utils'
import { OperatorGaps } from './OperatorGaps'

const meta = {
  component: OperatorGaps,
  tags: ['autodocs'],
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

export const Default: Story = {
  args: {
    operatorId: '3',
    timestamp: getPastDate().getTime(),
    timeRange: 'day',
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import moment from 'moment'
import WorstLinesChart from './WorstLinesChart'

const meta: Meta<typeof WorstLinesChart> = {
  component: WorstLinesChart,
  title: 'Pages/Dashboard/WorstLinesChart',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    startDate: {
      control: 'date',
      description: 'The start date of the chart.',
      table: {
        type: {
          summary: 'Moment',
        },
      },
    },
    endDate: {
      control: 'date',
      description: 'The end date of the chart.',
    },
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
  },
  render: (args) => (
    <WorstLinesChart
      startDate={moment(args.startDate)}
      endDate={moment(args.endDate)}
      operatorId={args.operatorId}
    />
  ),
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: moment(),
    endDate: moment().add(-7, 'day'),
    operatorId: '3',
  },
}

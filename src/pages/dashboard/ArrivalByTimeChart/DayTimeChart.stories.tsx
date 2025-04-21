import type { Meta, StoryObj } from '@storybook/react'
import moment from 'moment'
import DayTimeChart from './DayTimeChart'

const meta: Meta<typeof DayTimeChart> = {
  component: DayTimeChart,
  title: 'Pages/Dashboard/ArrivalByTimeChart',
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
      table: {
        type: {
          summary: 'Moment',
        },
      },
    },
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
  },
  render: (args) => (
    <DayTimeChart
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

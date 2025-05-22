import type { Meta, StoryObj } from '@storybook/react'
import dayjs from 'dayjs'
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
          summary: 'Dayjs',
        },
      },
    },
    endDate: {
      control: 'date',
      description: 'The end date of the chart.',
      table: {
        type: {
          summary: 'Dayjs',
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
      startDate={dayjs(args.startDate)}
      endDate={dayjs(args.endDate)}
      operatorId={args.operatorId}
    />
  ),
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: dayjs(),
    endDate: dayjs().add(-7, 'day'),
    operatorId: '3',
  },
}

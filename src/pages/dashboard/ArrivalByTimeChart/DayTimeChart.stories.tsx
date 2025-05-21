import type { Meta, StoryObj } from '@storybook/react'
import moment from 'moment'
import { getPastDate, waitForContent } from '../../../../.storybook/main'
import DayTimeChart from './DayTimeChart'

const meta = {
  component: DayTimeChart,
  title: 'Pages/Dashboard/ArrivalByTimeChart',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    startDate: {
      control: 'date',
      description: 'The start date of the chart.',
      table: {
        type: { summary: 'Moment' },
      },
    },
    endDate: {
      control: 'date',
      description: 'The end date of the chart.',
      table: {
        type: { summary: 'Moment' },
      },
    },
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
  },
  render: (args) => (
    <div style={{ height: 350, width: 700 }}>
      <DayTimeChart
        startDate={moment(args.startDate)}
        endDate={moment(args.endDate)}
        operatorId={args.operatorId}
      />
    </div>
  ),
  play: waitForContent,
} satisfies Meta<typeof DayTimeChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: moment(getPastDate(true)),
    endDate: moment(getPastDate()),
    operatorId: '3',
  },
}

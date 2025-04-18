import type { Meta, StoryObj } from '@storybook/react'
import moment from 'moment'
import AllLinesChart from './AllLinesChart'

const meta: Meta<typeof AllLinesChart> = {
  component: AllLinesChart,
  title: 'Pages/Dashboard/AllLinesChart',
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
  },
  render: (args) => (
    <AllLinesChart startDate={moment(args.startDate)} endDate={moment(args.endDate)} />
  ),
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: moment(),
    endDate: moment().add(-7, 'day'),
  },
}

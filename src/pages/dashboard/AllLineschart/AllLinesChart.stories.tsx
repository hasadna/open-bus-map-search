import type { Meta, StoryObj } from '@storybook/react'
import moment from 'moment'
import { getPastDate, waitForContent } from '../../../../.storybook/main'
import AllLinesChart from './AllLinesChart'

const meta = {
  component: AllLinesChart,
  title: 'Pages/Dashboard/AllLinesChart',
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
  },
  render: (args) => (
    <div style={{ width: 700 }}>
      <AllLinesChart startDate={moment(args.startDate)} endDate={moment(args.endDate)} />
    </div>
  ),
  play: waitForContent,
} satisfies Meta<typeof AllLinesChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: moment(getPastDate(true)),
    endDate: moment(getPastDate()),
  },
}

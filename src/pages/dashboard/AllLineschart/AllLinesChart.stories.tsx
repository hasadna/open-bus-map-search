import type { Meta, StoryObj } from '@storybook/react'
import moment from 'moment'
import { waitForContent, getPastDate } from '../../../../.storybook/utils.test'
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
  play: ({ canvasElement }) => waitForContent(canvasElement),
  render: (args) => (
    <div style={{ width: 700 }}>
      <AllLinesChart startDate={moment(args.startDate)} endDate={moment(args.endDate)} />
    </div>
  ),
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: getPastDate(),
    endDate: getPastDate(),
  },
}

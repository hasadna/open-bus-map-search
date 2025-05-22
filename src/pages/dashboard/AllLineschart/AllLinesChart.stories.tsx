import type { Meta, StoryObj } from '@storybook/react'
import { getPastDate, waitForContent } from '../../../../.storybook/main'
import AllLinesChart from './AllLinesChart'
import dayjs from 'src/dayjs'

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
        type: { summary: 'Dayjs' },
      },
    },
    endDate: {
      control: 'date',
      description: 'The end date of the chart.',
      table: {
        type: { summary: 'Dayjs' },
      },
    },
  },
  render: (args) => (
    <AllLinesChart startDate={dayjs(args.startDate)} endDate={dayjs(args.endDate)} />
  ),
  play: waitForContent,
} satisfies Meta<typeof AllLinesChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: dayjs(getPastDate()),
    endDate: dayjs(getPastDate()).add(-7, 'day'),
  },
}

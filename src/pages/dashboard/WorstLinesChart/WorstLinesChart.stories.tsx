import type { Meta, StoryObj } from '@storybook/react'
import { getPastDate, waitForContent } from '../../../../.storybook/main'
import WorstLinesChart from './WorstLinesChart'
import dayjs from 'src/dayjs'

const meta = {
  component: WorstLinesChart,
  title: 'Pages/Dashboard/WorstLinesChart',
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
    },
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
  },
  render: (args) => (
    <WorstLinesChart
      startDate={dayjs(args.startDate)}
      endDate={dayjs(args.endDate)}
      operatorId={args.operatorId}
    />
  ),
  play: waitForContent,
} satisfies Meta<typeof WorstLinesChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: dayjs(getPastDate()),
    endDate: dayjs(getPastDate()).add(-7, 'day'),
    operatorId: '3',
  },
}

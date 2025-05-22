import type { Meta, StoryObj } from '@storybook/react'
import WorstLinesChart from './WorstLinesChart'
import dayjs from 'src/pages/components/utils/dayjs'

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

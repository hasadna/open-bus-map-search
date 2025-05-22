import type { Meta, StoryObj } from '@storybook/react'
import AllLinesChart from './AllLinesChart'
import dayjs from 'src/dayjs'

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
  },
  render: (args) => (
    <AllLinesChart startDate={dayjs(args.startDate)} endDate={dayjs(args.endDate)} />
  ),
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: dayjs(),
    endDate: dayjs().add(-7, 'day'),
  },
}

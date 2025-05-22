import type { Meta, StoryObj } from '@storybook/react'
<<<<<<< HEAD
import moment from 'moment'
import { getPastDate, waitForContent } from '../../../../.storybook/main'
=======
>>>>>>> main
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
<<<<<<< HEAD
        type: { summary: 'Moment' },
=======
        type: {
          summary: 'Dayjs',
        },
>>>>>>> main
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
<<<<<<< HEAD
    <div style={{ width: 700 }}>
      <WorstLinesChart
        startDate={moment(args.startDate)}
        endDate={moment(args.endDate)}
        operatorId={args.operatorId}
      />
    </div>
=======
    <WorstLinesChart
      startDate={dayjs(args.startDate)}
      endDate={dayjs(args.endDate)}
      operatorId={args.operatorId}
    />
>>>>>>> main
  ),
  play: waitForContent,
} satisfies Meta<typeof WorstLinesChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
<<<<<<< HEAD
    startDate: moment(getPastDate(true)),
    endDate: moment(getPastDate()),
=======
    startDate: dayjs(),
    endDate: dayjs().add(-7, 'day'),
>>>>>>> main
    operatorId: '3',
  },
}

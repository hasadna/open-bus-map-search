import type { Meta, StoryObj } from '@storybook/react'
<<<<<<< HEAD
import moment from 'moment'
import { getPastDate, waitForContent } from '../../../../.storybook/main'
=======
>>>>>>> main
import DayTimeChart from './DayTimeChart'
import dayjs from 'src/dayjs'

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
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
  },
  render: (args) => (
<<<<<<< HEAD
    <div style={{ height: 350, width: 700 }}>
      <DayTimeChart
        startDate={moment(args.startDate)}
        endDate={moment(args.endDate)}
        operatorId={args.operatorId}
      />
    </div>
=======
    <DayTimeChart
      startDate={dayjs(args.startDate)}
      endDate={dayjs(args.endDate)}
      operatorId={args.operatorId}
    />
>>>>>>> main
  ),
  play: waitForContent,
} satisfies Meta<typeof DayTimeChart>

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

import type { Meta, StoryObj } from '@storybook/react'
<<<<<<< HEAD
import moment from 'moment'
import { getPastDate, waitForContent } from '../../../../.storybook/main'
=======
>>>>>>> main
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
  },
  render: (args) => (
<<<<<<< HEAD
    <div style={{ width: 700 }}>
      <AllLinesChart startDate={moment(args.startDate)} endDate={moment(args.endDate)} />
    </div>
=======
    <AllLinesChart startDate={dayjs(args.startDate)} endDate={dayjs(args.endDate)} />
>>>>>>> main
  ),
  play: waitForContent,
} satisfies Meta<typeof AllLinesChart>

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
  },
}

import type { Meta, StoryObj } from '@storybook/react-vite'
import { mocked } from 'storybook/test'
import { useGroupBy } from 'src/api/groupByService'
import dayjs from 'src/dayjs'
import { getPastDate } from '../../../../.storybook/main'
import AllLinesChart from './AllLinesChart'

const meta = {
  component: AllLinesChart,
  title: 'Pages/Dashboard/AllLinesChart',
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
    <AllLinesChart
      startDate={dayjs(args.startDate)}
      endDate={dayjs(args.endDate)}
      alertAllChartsZeroLinesHandling={function (arg: boolean): void {
        console.log('alertAllChartsZeroLinesHandling', arg)
      }}
    />
  ),
} satisfies Meta<typeof AllLinesChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  beforeEach: () => {
    mocked(useGroupBy).mockReturnValue([
      [
        {
          totalRoutes: 20235,
          totalPlannedRides: 47824,
          totalActualRides: 46939,
          operatorRef: {
            date: new Date('2024-02-11'),
            operatorRef: 3,
            agencyName: 'אגד',
          },
        },
        {
          totalRoutes: 6686,
          totalPlannedRides: 24970,
          totalActualRides: 24833,
          operatorRef: {
            date: new Date('2024-02-11'),
            operatorRef: 5,
            agencyName: 'דן',
          },
        },
      ],
      false,
      null,
    ])
  },
  args: {
    startDate: dayjs(getPastDate()).subtract(7, 'day'),
    endDate: dayjs(getPastDate()),
    alertAllChartsZeroLinesHandling: (arg: boolean) => {
      console.log('alertAllChartsZeroLinesHandling', arg)
    },
  },
}

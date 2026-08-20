import type { Meta, StoryObj } from '@storybook/react-vite'
import { mocked } from 'storybook/test'
import { useGroupBy } from 'src/api/groupByService'
import dayjs from 'src/dayjs'
import { getPastDate } from '../../../../.storybook/main'
import DayTimeChart from './DayTimeChart'

const meta = {
  component: DayTimeChart,
  title: 'Pages/Dashboard/ArrivalByTimeChart',
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
        type: {
          summary: 'Dayjs',
        },
      },
    },
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
  },
  render: (args) => (
    <DayTimeChart
      startDate={dayjs(args.startDate)}
      endDate={dayjs(args.endDate)}
      operatorId={args.operatorId}
      alertAllDayTimeChartHandling={function (arg: boolean): void {
        console.log('alertAllDayTimeChartHandling', arg)
      }}
    />
  ),
} satisfies Meta<typeof DayTimeChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  beforeEach: () => {
    mocked(useGroupBy).mockReturnValue([
      [
        {
          gtfsRouteDate: new Date('2024-02-11'),
          totalRoutes: 20235,
          totalPlannedRides: 47824,
          totalActualRides: 46939,
          operatorRef: {
            date: new Date('2024-02-11'),
            operatorRef: 3,
            agencyName: 'אגד',
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
    operatorId: '3',
    alertAllDayTimeChartHandling: (arg: boolean) => {
      console.log('alertAllDayTimeChartHandling', arg)
    },
  },
}

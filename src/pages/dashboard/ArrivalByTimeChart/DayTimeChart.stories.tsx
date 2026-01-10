import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import * as groupByService from 'src/api/groupByService'
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

const mockArrivalByTimeData: groupByService.GroupByRes[] = [
  {
    operatorRef: { operatorRef: 3, agencyName: 'אגד' },
    gtfsRouteDate: '2024-02-11',
    totalPlannedRides: 24064,
    totalActualRides: 23386,
    totalRoutes: 10172,
  },
  {
    operatorRef: { operatorRef: 3, agencyName: 'אגד' },
    gtfsRouteDate: '2024-02-12',
    totalPlannedRides: 23760,
    totalActualRides: 23553,
    totalRoutes: 10063,
  },
]

export const Default: Story = {
  args: {
    startDate: dayjs(getPastDate()).subtract(7, 'day'),
    endDate: dayjs(getPastDate()),
    operatorId: '3',
    alertAllDayTimeChartHandling: (arg: boolean) => {
      console.log('alertAllDayTimeChartHandling', arg)
    },
  },
  beforeEach: () => {
    vi.spyOn(groupByService, 'useGroupBy').mockReturnValue([mockArrivalByTimeData, false])
    return () => {
      vi.restoreAllMocks()
    }
  },
}

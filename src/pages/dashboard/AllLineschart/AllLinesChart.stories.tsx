import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import * as groupByService from 'src/api/groupByService'
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

const mockAllLinesData: groupByService.GroupByRes[] = [
  {
    operatorRef: { operatorRef: 3, agencyName: 'אגד' },
    totalPlannedRides: 159443,
    totalActualRides: 147990,
    totalRoutes: 68489,
  },
  {
    operatorRef: { operatorRef: 5, agencyName: 'דן' },
    totalPlannedRides: 81715,
    totalActualRides: 76082,
    totalRoutes: 22557,
  },
]

export const Default: Story = {
  args: {
    startDate: dayjs(getPastDate()).subtract(7, 'day'),
    endDate: dayjs(getPastDate()),
    alertAllChartsZeroLinesHandling: (arg: boolean) => {
      console.log('alertAllChartsZeroLinesHandling', arg)
    },
  },
  beforeEach: () => {
    vi.spyOn(groupByService, 'useGroupBy').mockReturnValue([mockAllLinesData, false])
    return () => {
      vi.restoreAllMocks()
    }
  },
}

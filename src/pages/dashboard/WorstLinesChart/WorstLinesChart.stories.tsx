import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import * as groupByService from 'src/api/groupByService'
import dayjs from 'src/dayjs'
import { getPastDate } from '../../../../.storybook/main'
import WorstLinesChart from './WorstLinesChart'

const meta = {
  component: WorstLinesChart,
  title: 'Pages/Dashboard/WorstLinesChart',
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
      alertWorstLineHandling={function (arg: boolean): void {
        console.log('alertWorstLineHandling', arg)
      }}
    />
  ),
} satisfies Meta<typeof WorstLinesChart>

export default meta

type Story = StoryObj<typeof meta>

const mockWorstLinesData: groupByService.GroupByRes[] = [
  {
    operatorRef: { operatorRef: 3, agencyName: 'אגד' },
    lineRef: 2974,
    routeShortName: '["22"]',
    routeLongName: 'קרית שמונה<->תל אביב יפו',
    totalPlannedRides: 159443,
    totalActualRides: 147990,
    totalRoutes: 68489,
  },
]

export const Default: Story = {
  args: {
    startDate: dayjs(getPastDate()).subtract(7, 'day'),
    endDate: dayjs(getPastDate()),
    operatorId: '3',
    alertWorstLineHandling: (arg: boolean) => {
      console.log('alertWorstLineHandling', arg)
    },
  },
  beforeEach: () => {
    vi.spyOn(groupByService, 'useGroupBy').mockReturnValue([mockWorstLinesData, false])
    return () => {
      vi.restoreAllMocks()
    }
  },
}

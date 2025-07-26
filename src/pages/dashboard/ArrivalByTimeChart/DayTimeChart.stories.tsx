import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { getPastDate } from '../../../../.storybook/main'
import DayTimeChart from './DayTimeChart'
import dayjs from 'src/dayjs'

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
  parameters: {
    msw: {
      handlers: [
        http.get(
          'https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2024-02-05&date_to=2024-02-12&group_by=operator_ref,gtfs_route_date&exclude_hour_from=23&exclude_hour_to=2',
          async () => {
            const { arrivalByTimeChart } = await import('../../../../.storybook/mockData')
            return HttpResponse.json(arrivalByTimeChart)
          },
        ),
      ],
    },
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

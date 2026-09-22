import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import dayjs from 'src/dayjs'
import { toCivilDate } from 'src/model/time/civilDate'
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
        type: { summary: 'CivilDate' },
      },
    },
    endDate: {
      control: 'date',
      description: 'The end date of the chart.',
      table: {
        type: {
          summary: 'CivilDate',
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
      startDate={toCivilDate(args.startDate)!}
      endDate={toCivilDate(args.endDate)!}
      operatorId={args.operatorId}
      alertAllDayTimeChartHandling={function (arg: boolean): void {
        console.log('alertAllDayTimeChartHandling', arg)
      }}
    />
  ),
} satisfies Meta<typeof DayTimeChart>

export default meta

type Story = StoryObj<typeof meta>

const URL =
  'https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2024-02-05&date_to=2024-02-12&group_by=operator_ref,gtfs_route_date&exclude_hour_from=23&exclude_hour_to=2'

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(URL, async () => {
          const { arrivalByTimeChart } = await import('../../../../.storybook/mockData')
          return HttpResponse.json(arrivalByTimeChart)
        }),
      ],
    },
  },
  args: {
    startDate: toCivilDate(dayjs(getPastDate()).subtract(7, 'day'))!,
    endDate: toCivilDate(dayjs(getPastDate()))!,
    operatorId: '3',
    alertAllDayTimeChartHandling: (arg: boolean) => {
      console.log('alertAllDayTimeChartHandling', arg)
    },
  },
}

import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
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

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          (info) => {
            const url = new URL(info.url)
            return url.pathname === '/gtfs_agencies/list'
          },
          async () => {
            const { agencies } = await import('../../../../.storybook/mockData')
            return HttpResponse.json(agencies)
          },
        ),
        http.get(
          (info) => {
            const url = new URL(info.url)
            return (
              url.pathname === '/gtfs_rides_agg/group_by' &&
              url.searchParams.get('group_by') === 'operator_ref,line_ref'
            )
          },
          async () => {
            const { worstLinesChart } = await import('../../../../.storybook/mockData')
            return HttpResponse.json(worstLinesChart)
          },
        ),
      ],
    },
  },
  args: {
    startDate: dayjs(getPastDate()).subtract(7, 'day'),
    endDate: dayjs(getPastDate()),
    operatorId: '3',
    alertWorstLineHandling: (arg: boolean) => {
      console.log('alertWorstLineHandling', arg)
    },
  },
}

import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
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
  parameters: {
    msw: {
      handlers: [
        http.get(
          (info) => {
            const url = new URL(info.request.url)
            return url.pathname === '/gtfs_agencies/list'
          },
          async () => {
            const { agencies } = await import('../../../../.storybook/mockData')
            return HttpResponse.json(agencies)
          },
        ),
        http.get(
          (info) => {
            const url = new URL(info.request.url)
            return (
              url.pathname === '/gtfs_rides_agg/group_by' &&
              url.searchParams.get('group_by') === 'operator_ref'
            )
          },
          async () => {
            const { allLineMock } = await import('../../../../.storybook/mockData')
            return HttpResponse.json(allLineMock)
          },
        ),
      ],
    },
  },
  args: {
    startDate: dayjs(getPastDate()).subtract(7, 'day'),
    endDate: dayjs(getPastDate()),
    alertAllChartsZeroLinesHandling: (arg: boolean) => {
      console.log('alertAllChartsZeroLinesHandling', arg)
    },
  },
}

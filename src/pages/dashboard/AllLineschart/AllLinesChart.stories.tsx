import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { formatIsraelDate, shiftIsraelDate } from 'src/dayjs'
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
        type: { summary: 'string' },
      },
    },
    endDate: {
      control: 'date',
      description: 'The end date of the chart.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  render: (args) => (
    <AllLinesChart
      startDate={args.startDate}
      endDate={args.endDate}
      alertAllChartsZeroLinesHandling={function (arg: boolean): void {
        console.log('alertAllChartsZeroLinesHandling', arg)
      }}
    />
  ),
} satisfies Meta<typeof AllLinesChart>

export default meta

type Story = StoryObj<typeof meta>

const URL =
  'https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2024-02-05&date_to=2024-02-12&group_by=operator_ref&exclude_hour_from=23&exclude_hour_to=2'

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(URL, async () => {
          const { allLineMock } = await import('../../../../.storybook/mockData')
          return HttpResponse.json(allLineMock)
        }),
      ],
    },
  },
  args: {
    startDate: shiftIsraelDate(formatIsraelDate(getPastDate()), -7),
    endDate: formatIsraelDate(getPastDate()),
    alertAllChartsZeroLinesHandling: (arg: boolean) => {
      console.log('alertAllChartsZeroLinesHandling', arg)
    },
  },
}

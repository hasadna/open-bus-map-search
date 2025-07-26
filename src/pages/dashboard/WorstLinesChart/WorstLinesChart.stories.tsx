import type { Meta, StoryObj } from '@storybook/react-vite'
import { getPastDate } from '../../../../.storybook/main'
import mockData from '../../../../.storybook/mockData'
import WorstLinesChart from './WorstLinesChart'
import dayjs from 'src/dayjs'
import { http, HttpResponse } from 'msw'

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
        http.get(mockData.worstLinesChart.url, () => {
          return HttpResponse.json(mockData.worstLinesChart.data)
        }),
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

import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import dayjs from 'src/dayjs'
import { getPastDate } from '../../../.storybook/main'
import { OperatorGaps } from './OperatorGaps'

const meta = {
  component: OperatorGaps,
  title: 'Pages/Operator/OperatorGaps',
  argTypes: {
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
    date: {
      control: 'text',
      description: 'The date of the chart (YYYY-MM-DD).',
    },
    timeRange: {
      control: 'select',
      description: 'The time range of the chart.',
      options: ['day', 'week', 'month'],
    },
  },
} satisfies Meta<typeof OperatorGaps>

export default meta

type Story = StoryObj<typeof meta>

const URL =
  'https://open-bus-stride-api.hasadna.org.il/gtfs_rides_agg/group_by?date_from=2024-02-11&date_to=2024-02-12&group_by=operator_ref&exclude_hour_from=23&exclude_hour_to=2'

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(URL, async () => {
          const { operatorGaps } = await import('../../../.storybook/mockData')
          return HttpResponse.json(operatorGaps)
        }),
      ],
    },
  },
  args: {
    operatorId: '3',
    date: dayjs(getPastDate()).format('YYYY-MM-DD'),
    timeRange: 'day',
  },
}

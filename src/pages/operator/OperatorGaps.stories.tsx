import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
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
    timestamp: {
      control: 'date',
      description: 'The timestamp of the chart.',
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
            const { agencies } = await import('../../../.storybook/mockData')
            return HttpResponse.json(agencies)
          },
        ),
        http.get(
          (info) => {
            const url = new URL(info.url)
            return (
              url.pathname === '/gtfs_rides_agg/group_by' &&
              url.searchParams.get('group_by') === 'operator_ref'
            )
          },
          async () => {
            const { operatorGaps } = await import('../../../.storybook/mockData')
            return HttpResponse.json(operatorGaps)
          },
        ),
      ],
    },
  },
  args: {
    operatorId: '3',
    timestamp: getPastDate().getTime(),
    timeRange: 'day',
  },
}

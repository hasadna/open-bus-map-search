import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { getPastDate } from '../../../.storybook/main'
import { OperatorRoutes } from './OperatorRoutes'

const meta = {
  component: OperatorRoutes,
  title: 'Pages/Operator/OperatorRoutes',
  argTypes: {
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
    timestamp: {
      control: 'date',
      description: 'The timestamp of the chart.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: 700 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OperatorRoutes>

export default meta

type Story = StoryObj<typeof meta>

const URL =
  'https://open-bus-stride-api.hasadna.org.il/gtfs_routes/list?limit=-1&date_from=2024-02-12&date_to=2024-02-12&operator_refs=3&order_by=route_long_name%20asc'

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(URL, async () => {
          const { operatorRoutes } = await import('../../../.storybook/mockData')
          return HttpResponse.json(operatorRoutes)
        }),
      ],
    },
  },
  args: {
    operatorId: '3',
    timestamp: getPastDate().getTime(),
  },
}

import type { Meta, StoryObj } from '@storybook/react-vite'
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

export const Default: Story = {
  args: {
    operatorId: '3',
    timestamp: getPastDate().getTime(),
  },
}

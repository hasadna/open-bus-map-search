import type { Meta, StoryObj } from '@storybook/react'
import { OperatorRoutes } from './OperatorRoutes'
import { waitForContent, getPastDate } from '../../../.storybook/utils.test'

const meta = {
  component: OperatorRoutes,
  tags: ['autodocs'],
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
  play: ({ canvasElement }) => waitForContent(canvasElement),
} satisfies Meta<typeof OperatorRoutes>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    operatorId: '3',
    timestamp: getPastDate().getTime(),
  },
}

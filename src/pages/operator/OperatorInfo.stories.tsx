import type { Meta, StoryObj } from '@storybook/react-vite'
import { OperatorInfo } from './OperatorInfo'

const meta = {
  component: OperatorInfo,
  title: 'Pages/Operator/OperatorInfo',
  argTypes: {
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
  },
} satisfies Meta<typeof OperatorInfo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    operatorId: '3',
  },
}

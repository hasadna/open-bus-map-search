import { Meta, StoryObj } from '@storybook/react'
import OperatorHbarChart from './OperatorHbarChart'

const meta = {
  title: 'Pages/Dashboard/Bar/OperatorHbarChart',
  component: OperatorHbarChart,
} satisfies Meta<typeof OperatorHbarChart>

export default meta

type Story = StoryObj<typeof OperatorHbarChart>

const mockOperatorsData = [
  {
    name: 'אגד',
    total: 10,
    actual: 5,
  },
  {
    name: 'סופרבוס',
    total: 8,
    actual: 3,
  },
]

export const Default: Story = {
  args: {
    operators: mockOperatorsData,
  },
}

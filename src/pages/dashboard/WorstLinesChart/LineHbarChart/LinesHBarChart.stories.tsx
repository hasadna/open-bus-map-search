import { Meta, StoryObj } from '@storybook/react'
import LinesHbarChart from './LinesHbarChart'

const meta: Meta<typeof LinesHbarChart> = {
  title: 'Pages/Dashboard/Bar/LinesHbarChart',
  component: LinesHbarChart,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof LinesHbarChart>
const mockLines = [
  {
    id: '1',
    short_name: '5',
    long_name: 'Long Name 1',
    operator_name: 'אגד',
    total: 10000,
    actual: 6000,
  },
  {
    id: '2',
    short_name: '8',
    long_name: 'Long Name 2',
    operator_name: 'אלקטרה אפיקים',
    total: 10000,
    actual: 7000,
  },
  {
    id: '3',
    short_name: '10',
    long_name: 'Long Name 3',
    operator_name: 'סופרבוס',
    total: 10000,
    actual: 8000,
  },
]

export const Default: Story = {
  args: {
    lines: mockLines,
    complement: false,
  },
}

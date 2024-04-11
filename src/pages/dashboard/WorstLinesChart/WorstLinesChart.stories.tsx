import { Meta, StoryObj } from '@storybook/react'
import WorstLinesChart from './WorstLinesChart'
import moment from 'moment'

const meta: Meta<typeof WorstLinesChart> = {
  title: 'Components/Dashboard/WorstLinesChart',
  component: WorstLinesChart,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof WorstLinesChart>

const yesterday = moment().subtract(7, 'days')
const now = moment()
export const Default: Story = {
  args: {
    startDate: yesterday,
    endDate: now,
  },
}

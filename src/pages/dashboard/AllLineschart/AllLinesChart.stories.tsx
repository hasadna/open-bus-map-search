import { Meta, StoryObj } from '@storybook/react'
import AllLinesChart from './AllLinesChart'
import moment from 'moment'

const meta: Meta<typeof AllLinesChart> = {
  title: 'Components/Dashboard/AllLinesChart',
  component: AllLinesChart,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AllLinesChart>

const yesterday = moment().subtract(1, 'days')
const now = moment()
export const Default: Story = {
  args: {
    startDate: yesterday,
    endDate: now,
  },
}

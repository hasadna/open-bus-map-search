import { Meta, StoryObj } from '@storybook/react'
import DayTimeChart from './DayTimeChart'
import moment from 'moment'

const meta: Meta<typeof DayTimeChart> = {
  title: 'Components/Dashboard/DayTimeChart',
  component: DayTimeChart,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DayTimeChart>

const yesterday = moment().subtract(7, 'days')
const now = moment()
export const Default: Story = {
  args: {
    startDate: yesterday,
    endDate: now,
    operatorId: '3',
  },
}

import { Meta, StoryObj } from '@storybook/react'
import ArrivalByTimeChart from './ArrivalByTimeChart'
import testBusData from './testdata/data.json'

const meta: Meta<typeof ArrivalByTimeChart> = {
  title: 'Components/Dashboard/ArrivalByTimeChart',
  component: ArrivalByTimeChart,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ArrivalByTimeChart>

export const Default: Story = {
  args: {
    data: testBusData,
    operatorId: testBusData[0].id,
  },
}

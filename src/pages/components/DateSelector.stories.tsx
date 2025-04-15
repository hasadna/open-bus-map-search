import { Meta, StoryObj } from '@storybook/react'
import moment from 'moment'
import { type DataSelectorProps, DateSelector } from './DateSelector'

const convertDates = (args: DataSelectorProps): DataSelectorProps => ({
  ...args,
  time: moment(args.time),
  minDate: args.minDate ? moment(args.minDate) : undefined,
})

const meta: Meta<typeof DateSelector> = {
  title: 'Components/DateSelector',
  component: DateSelector,
  render: (args: DataSelectorProps) => {
    const transformedArgs = convertDates(args)
    return <DateSelector {...transformedArgs} />
  },
  parameters: {
    layout: 'centered',
  },
  args: {
    time: moment().startOf('day'),
    disabled: false,
  },
  argTypes: {
    time: { control: 'date' },
    minDate: { control: 'date' },
    customLabel: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof DateSelector>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Invalid: Story = {
  args: {
    time: moment().subtract(8, 'days').startOf('day'),
    minDate: moment().subtract(7, 'days').startOf('day'),
  },
}

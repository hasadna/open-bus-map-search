import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import moment from 'moment'
import { DateSelector } from './DateSelector'

const meta: Meta<typeof DateSelector> = {
  title: 'Components/DateSelector',
  component: DateSelector,
  render: ({ time, minDate, ...args }) => {
    return (
      <DateSelector {...args} time={moment(time)} minDate={minDate ? moment(minDate) : undefined} />
    )
  },
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
    time: moment().startOf('day'),
  },
  argTypes: {
    time: { control: 'date' },
    minDate: { control: 'date' },
    customLabel: { control: 'text', type: 'string' },
    disabled: { control: 'boolean', type: 'boolean' },
    onChange: { action: 'onChange', type: 'function' },
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

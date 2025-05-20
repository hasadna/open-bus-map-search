import { Meta, StoryObj } from '@storybook/react'
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
    time: moment().startOf('day'),
  },
  argTypes: {
    time: {
      control: 'date',
      description: 'The currently selected date',
      table: {
        type: { summary: 'Moment' },
        defaultValue: { summary: 'moment()' },
      },
    },
    onChange: {
      action: 'onChange',
      description: 'Callback function when date is changed',
      table: {
        type: { summary: '(timeValid: moment.Moment | null) => void' },
      },
    },
    minDate: {
      control: 'date',
      description: 'Minimum selectable date',
      table: {
        type: { summary: 'Moment' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the date selector is disabled',
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
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

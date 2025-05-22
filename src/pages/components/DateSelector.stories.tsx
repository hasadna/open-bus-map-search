import { Meta, StoryObj } from '@storybook/react'
import { DateSelector } from './DateSelector'
import dayjs from 'src/dayjs'

const meta: Meta<typeof DateSelector> = {
  title: 'Components/DateSelector',
  component: DateSelector,
  render: ({ time, minDate, ...args }) => {
    return (
      <DateSelector {...args} time={dayjs(time)} minDate={minDate ? dayjs(minDate) : undefined} />
    )
  },
  parameters: {
    layout: 'centered',
  },
  args: {
    time: dayjs().startOf('day'),
  },
  argTypes: {
    time: {
      control: 'date',
      description: 'The currently selected date',
      table: {
        type: { summary: 'Dayjs' },
        defaultValue: { summary: 'dayjs()' },
      },
    },
    onChange: {
      action: 'onChange',
      description: 'Callback function when date is changed',
      table: {
        type: { summary: '(timeValid: dayjs.Dayjs | null) => void' },
      },
    },
    minDate: {
      control: 'date',
      description: 'Minimum selectable date',
      table: {
        type: { summary: 'Dayjs' },
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
    time: dayjs().subtract(8, 'days').startOf('day'),
    minDate: dayjs().subtract(7, 'days').startOf('day'),
  },
}

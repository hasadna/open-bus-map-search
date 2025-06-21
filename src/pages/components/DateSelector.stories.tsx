import { Meta, StoryObj } from '@storybook/react-vite'
import { DateSelector } from './DateSelector'
import dayjs from 'src/dayjs'

const meta = {
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
    onChange: () => {},
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
} satisfies Meta<typeof DateSelector>

export default meta

type Story = StoryObj<typeof meta>

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

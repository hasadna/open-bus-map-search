import { Meta, StoryObj } from '@storybook/react-vite'
import { formatIsraelDate, shiftIsraelDate } from 'src/dayjs'
import { getPastDate } from '../../../.storybook/main'
import { DateSelector } from './DateSelector'

// The `control: 'date'` knob yields a number (ms) at runtime; normalize whatever it
// gives to the civil-date "YYYY-MM-DD" string the component now expects.
const toCivilDate = (value: string | number | Date) => formatIsraelDate(new Date(value))

const meta = {
  title: 'Components/DateSelector',
  component: DateSelector,
  render: ({ time, minDate, ...args }) => {
    return (
      <DateSelector
        {...args}
        time={toCivilDate(time)}
        minDate={minDate ? toCivilDate(minDate) : undefined}
      />
    )
  },
  parameters: {
    layout: 'centered',
  },
  args: {
    time: toCivilDate(getPastDate()),
    onChange: () => {},
  },
  argTypes: {
    time: {
      control: 'date',
      description: 'The currently selected date',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"YYYY-MM-DD"' },
      },
    },
    onChange: {
      action: 'onChange',
      description: 'Callback function when date is changed',
      table: {
        type: { summary: '(date: string | null) => void' },
      },
    },
    minDate: {
      control: 'date',
      description: 'Minimum selectable date',
      table: {
        type: { summary: 'string' },
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
    time: shiftIsraelDate(toCivilDate(getPastDate()), -8),
    minDate: shiftIsraelDate(toCivilDate(getPastDate()), -7),
  },
}

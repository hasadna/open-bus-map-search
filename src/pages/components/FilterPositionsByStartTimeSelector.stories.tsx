import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterPositionsByStartTimeSelector } from './FilterPositionsByStartTimeSelector'

const timeOptions = [
  { value: '06:00:00', label: '06:00:00' },
  { value: '07:00:00', label: '07:00:00' },
  { value: '08:00:00', label: '08:00:00' },
  { value: '09:00:00', label: '09:00:00' },
  { value: '10:00:00', label: '10:00:00' },
  { value: '11:00:00', label: '11:00:00' },
  { value: '12:00:00', label: '12:00:00' },
  { value: '13:00:00', label: '13:00:00' },
  { value: '14:00:00', label: '14:00:00' },
  { value: '15:00:00', label: '15:00:00' },
  { value: '16:00:00', label: '16:00:00' },
  { value: '17:00:00', label: '17:00:00' },
  { value: '18:00:00', label: '18:00:00' },
  { value: '19:00:00', label: '19:00:00' },
  { value: '20:00:00', label: '20:00:00' },
  { value: '21:00:00', label: '21:00:00' },
  { value: '22:00:00', label: '22:00:00' },
  { value: '23:00:00', label: '23:00:00' },
]

const meta = {
  title: 'Components/FilterPositionsByStartTimeSelector',
  component: FilterPositionsByStartTimeSelector,
  parameters: {
    layout: 'centered',
  },
  args: {
    startTime: '08:00:00',
    options: timeOptions,
    setStartTime: () => {},
  },
  argTypes: {
    startTime: {
      type: 'string',
      description: 'Selected start time value',
      control: 'text',
    },
    setStartTime: {
      description: 'Callback function to update start time',
      action: 'setStartTime',
    },
    options: {
      description: 'Array of time options with value and label',
      control: 'object',
      table: {
        type: { summary: '{ value: string, label: string }[]' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the Filter Positions By Start Time Selector',
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
  decorators: [
    (Story, meta) => {
      const { t } = useTranslation()
      const [time, setTime] = useState<string | undefined>(meta?.args?.startTime)

      return (
        <div style={{ width: '300px', padding: '20px' }}>
          <Story
            args={{
              ...meta.args,
              startTime: time,
              setStartTime: (v) => {
                setTime(v)
                meta.args.setStartTime?.(v)
              },
            }}
          />
          <div style={{ padding: '20px' }}>
            {t('choose_start_time')}: {time}
          </div>
        </div>
      )
    },
  ],
} satisfies Meta<typeof FilterPositionsByStartTimeSelector>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    startTime: '',
    options: [],
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

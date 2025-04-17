import { Meta, StoryObj } from '@storybook/react'
import ClearButton from './ClearButton'

const meta: Meta<typeof ClearButton> = {
  title: 'Components/ClearButton',
  component: ClearButton,
  tags: ['autodocs'],
  argTypes: {
    onClearInput: { action: 'onClearInput' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

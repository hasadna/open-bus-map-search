import { Meta, StoryObj } from '@storybook/react'
import { Label } from './Label'

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    text: {
      description: 'The text content of the label.',
      control: { type: 'text' },
    },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Label>

export const Default: Story = { args: { text: 'Some Label' } }

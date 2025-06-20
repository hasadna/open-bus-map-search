import { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './Label'

const meta = {
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
} satisfies Meta<typeof Label>

export default meta

type Story = StoryObj<typeof Label>

export const Default: Story = { args: { text: 'Some Label' } }

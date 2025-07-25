import type { Meta, StoryObj } from '@storybook/react-vite'
import Widget from 'src/shared/Widget'

const meta = {
  title: 'Components/Widget',
  component: Widget,
  decorators: (Story) => (
    <div style={{ background: '#f0f2f5', padding: '20px' }}>
      <Story />
    </div>
  ),
  argTypes: {
    title: {
      control: 'text',
      description: 'Title to be displayed at the top of the Widget',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    children: {
      control: false,
      description: 'Content to be displayed inside the Widget',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    sx: {
      control: 'object',
      description:
        'The system prop that allows defining system overrides as well as additional CSS styles.',
      table: {
        type: { summary: 'SxProps<Theme>' },
      },
    },
    marginBottom: {
      control: 'text',
      description: 'Sets the margin-bottom CSS property To 16px.',
      table: {
        type: { summary: 'boolean' },
      },
    },
    className: {
      control: 'text',
      description: 'Class name for custom styling',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Widget>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'שלום חברים!',
    children: 'ככה נראה Widget',
  },
}
